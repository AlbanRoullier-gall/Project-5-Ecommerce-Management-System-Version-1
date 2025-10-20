import axios from "axios";
import { Request, Response } from "express";
import { SERVICES } from "../config";
// Use dynamic require to avoid type dependency at compile time
// eslint-disable-next-line @typescript-eslint/no-var-requires
const StripeLib: any = require("stripe");

/**
 * Orchestration pour la création de paiement:
 * - Attache le snapshot checkout au cart-service (Stripe-agnostique)
 * - Crée la session Stripe via payment-service
 * - Enregistre le mapping csid → sessionId dans le Gateway (mémoire) pour le webhook
 */

// Mémoire volatile dans le Gateway (peut être remplacée par Redis central si besoin)
const csidToSessionInMemory = new Map<string, string>();

export const handleCreatePayment = async (req: Request, res: Response) => {
  try {
    const { cartSessionId, snapshot, payment } = req.body || {};
    if (!cartSessionId || !snapshot || !payment) {
      res
        .status(400)
        .json({ error: "cartSessionId, snapshot, payment are required" });
      return;
    }

    // 1) Attacher le snapshot au panier (enrichi avec items normalisés)
    let enrichedSnapshot = snapshot;
    try {
      const cartResp = await axios.get(`${SERVICES.cart}/api/cart`, {
        params: { sessionId: cartSessionId },
      });
      const cart = cartResp.data?.cart;
      if (cart && Array.isArray(cart.items)) {
        const normalizedItems = (cart.items || []).map((it: any) => ({
          productId: Number(it.productId ?? it.product_id),
          quantity: Number(it.quantity) || 0,
          price: Number(it.price) || 0,
          vatRate: Number(it.vatRate ?? it.vat_rate) || 0,
        }));
        enrichedSnapshot = { ...snapshot, items: normalizedItems };
      }
    } catch {}
    await axios.patch(`${SERVICES.cart}/api/cart/checkout`, enrichedSnapshot, {
      params: { sessionId: cartSessionId },
      headers: { "Content-Type": "application/json" },
    });

    // 2) Créer la session Stripe via payment-service
    // Forcer l'ajout du placeholder csid dans les URLs de redirection
    const ensureCsid = (url: string) =>
      url.includes("{CHECKOUT_SESSION_ID}")
        ? url
        : url + (url.includes("?") ? "&" : "?") + "csid={CHECKOUT_SESSION_ID}";

    const paymentPayload = {
      ...payment,
      successUrl: ensureCsid(payment.successUrl),
      cancelUrl: ensureCsid(payment.cancelUrl),
      metadata: { ...(payment.metadata || {}), cartSessionId },
    };

    const paymentResp = await axios.post(
      `${SERVICES.payment}/api/payment/create`,
      paymentPayload,
      { headers: { "Content-Type": "application/json" } }
    );

    const { id: checkoutSessionId, url } =
      paymentResp.data.payment || paymentResp.data || {};
    if (checkoutSessionId) {
      csidToSessionInMemory.set(checkoutSessionId, cartSessionId);
    }

    res.status(201).json({
      url,
      checkoutSessionId,
    });
  } catch (error: any) {
    console.error(
      "handleCreatePayment error:",
      error?.response?.data || error?.message
    );
    res.status(500).json({ error: "Payment creation failed" });
  }
};

export const getSessionIdForCsid = (csid: string): string | undefined => {
  return csidToSessionInMemory.get(csid);
};

export const deleteCsidMapping = (csid: string): void => {
  csidToSessionInMemory.delete(csid);
};

/**
 * Webhook Stripe (orchestration côté Gateway)
 * - Vérifie la signature
 * - Sur checkout.session.completed : récupère snapshot/cart, crée la commande, envoie l'email
 */
export const handleStripeWebhook = async (req: Request, res: Response) => {
  const stripe = new StripeLib(process.env["STRIPE_SECRET_KEY"] || "", {
    apiVersion: "2023-08-16",
  });
  const webhookSecret = process.env["STRIPE_WEBHOOK_SECRET"] || "";

  const sig = req.headers["stripe-signature"] as string;
  let event: any;
  try {
    event = stripe.webhooks.constructEvent(
      (req as any).rawBody,
      sig,
      webhookSecret
    );
  } catch (err: any) {
    console.error("⚠️  Webhook signature verification failed.", err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as any;
      const csid = session.id;
      const paymentIntentId: string =
        typeof session.payment_intent === "string"
          ? (session.payment_intent as string)
          : session.payment_intent?.id || "";

      // 1) Retrouver le cartSessionId depuis notre mémoire côté Gateway
      const cartSessionId = getSessionIdForCsid(csid);
      if (!cartSessionId) {
        console.warn("No cartSessionId mapping found for csid:", csid);
        res.json({ received: true });
        return;
      }

      // 2) Récupérer cart et snapshot
      const [cartResp, snapshotResp] = await Promise.all([
        axios.get(`${SERVICES.cart}/api/cart`, {
          params: { sessionId: cartSessionId },
        }),
        axios.get(`${SERVICES.cart}/api/cart/checkout`, {
          params: { sessionId: cartSessionId },
        }),
      ]);

      const cart = cartResp.data?.cart;
      const snapshot = snapshotResp.data?.snapshot;

      // Choisir la source des items: snapshot.items prioritaire, sinon cart.items
      const sourceItems: any[] = Array.isArray(snapshot?.items)
        ? (snapshot.items as any[])
        : cart.items || [];

      if (!cart || !snapshot) {
        console.error("Missing cart or snapshot for session:", cartSessionId);
        res.json({ received: true });
        return;
      }

      // 3) Charger les infos produits pour enrichir nom/TVA (si disponible)
      const productIdToInfo = new Map<
        number,
        { name: string; vatRate?: number }
      >();
      try {
        const productIds: number[] = (sourceItems || [])
          .map((it: any) => Number(it.product_id ?? it.productId))
          .filter((id: number) => Number.isFinite(id) && id > 0);
        const uniqueIds = Array.from(new Set(productIds));
        await Promise.all(
          uniqueIds.map(async (pid) => {
            try {
              const r = await axios.get(
                `${SERVICES.product}/api/products/${pid}`
              );
              const p = r.data?.product || r.data;
              if (p) {
                const name = p.name || p.product?.name || "Produit";
                const rawVat = p.vatRate ?? p.product?.vatRate;
                const parsedVat = Number(rawVat);
                const vatRate =
                  Number.isFinite(parsedVat) && parsedVat >= 0 ? parsedVat : 0;
                productIdToInfo.set(pid, { name, vatRate });
              }
            } catch {}
          })
        );
      } catch {}

      // 4) Résoudre customerId si absent
      let customerId: number | undefined =
        snapshot.customer?.customerId || snapshot.customerId;
      if (!customerId) {
        const customerEmail = snapshot.customer?.email || snapshot.email;
        if (customerEmail) {
          try {
            const resp = await axios.get(
              `${SERVICES.customer}/api/customers/by-email/${encodeURIComponent(
                customerEmail
              )}`
            );
            customerId = resp.data?.customer?.customerId;
          } catch {}
        }
      }

      // 4) Construire payload de création d'ordre complet
      const orderCreate = {
        customerId,
        customerSnapshot:
          snapshot.customer || snapshot.customerSnapshot || snapshot,
        totalAmountHT: cart.subtotal,
        totalAmountTTC: cart.total,
        paymentMethod: "stripe",
        notes: snapshot.notes || undefined,
      };

      // Créer d'abord l'ordre
      const orderResp = await axios.post(
        `${SERVICES.order}/api/orders`,
        { ...orderCreate, paymentIntentId },
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      const orderId = orderResp.data?.order?.id;

      // Créer les items (robuste: on tente chaque item indépendamment)
      for (const item of sourceItems || []) {
        try {
          const pid = Number(item.productId ?? item.product_id);
          const rawVatAny =
            productIdToInfo.get(pid)?.vatRate ?? item.vatRate ?? item.vat_rate;
          const parsedVat = Number(rawVatAny);
          const vatRate =
            Number.isFinite(parsedVat) && parsedVat >= 0 ? parsedVat : 0;
          const vatMultiplier = 1 + vatRate / 100;
          const pInfo = productIdToInfo.get(pid);

          const quantity = Number(item.quantity) || 0;
          const unitPriceTTC = Number(item.price) || 0;
          const unitPriceHT = unitPriceTTC / vatMultiplier;
          const totalPriceTTC = unitPriceTTC * quantity;
          const totalPriceHT = totalPriceTTC / vatMultiplier;

          await axios.post(
            `${SERVICES.order}/api/orders/${orderId}/items`,
            {
              orderId: Number(orderId),
              productId: pid,
              productName: (
                pInfo?.name ||
                item.product_name ||
                "Produit"
              ).toString(),
              quantity,
              unitPriceHT,
              unitPriceTTC,
              vatRate,
              totalPriceHT,
              totalPriceTTC,
            },
            { headers: { "Content-Type": "application/json" } }
          );
        } catch (e: any) {
          console.warn(
            "Create order item failed (non-blocking):",
            e?.response?.data || e?.message
          );
        }
      }

      // Adresses
      const mkAddress = async (addressType: string, addressSnapshot: any) => {
        if (!addressSnapshot) return;
        await axios.post(
          `${SERVICES.order}/api/orders/${orderId}/addresses`,
          { orderId, addressType, addressSnapshot },
          { headers: { "Content-Type": "application/json" } }
        );
      };
      try {
        await mkAddress(
          "shipping",
          snapshot.shippingAddress || snapshot.shipping_address
        );
      } catch (e: any) {
        console.warn(
          "Create shipping address failed (non-blocking):",
          e?.response?.data || e?.message
        );
      }
      try {
        await mkAddress(
          "billing",
          snapshot.billingAddress || snapshot.billing_address
        );
      } catch (e: any) {
        console.warn(
          "Create billing address failed (non-blocking):",
          e?.response?.data || e?.message
        );
      }

      // 4) Déclencher l'email de confirmation (avec items + adresse)
      try {
        const shipping =
          snapshot.shippingAddress || snapshot.shipping_address || {};
        const customerFirstName =
          snapshot.customer?.firstName || shipping.firstName || "";
        const customerLastName =
          snapshot.customer?.lastName || shipping.lastName || "";

        // Construire les items pour l'email (TTC) + taux de TVA pour calcul HT côté email-service
        const emailItems = (sourceItems || []).map((item: any) => {
          const pid = Number(item.productId ?? item.product_id);
          const pInfo = productIdToInfo.get(pid);
          const name = (
            pInfo?.name ||
            item.product_name ||
            "Produit"
          ).toString();
          const unitPrice = Number(item.price);
          const quantity = Number(item.quantity);
          const totalPrice = unitPrice * quantity;
          const rawVatAny =
            productIdToInfo.get(pid)?.vatRate ?? item.vatRate ?? item.vat_rate;
          const parsedVat = Number(rawVatAny);
          const vatRate =
            Number.isFinite(parsedVat) && parsedVat >= 0 ? parsedVat : 21;
          return { name, quantity, unitPrice, totalPrice, vatRate };
        });

        const emailPayload = {
          customerEmail: snapshot.customer?.email || snapshot.email || "",
          customerName: `${customerFirstName} ${customerLastName}`.trim(),
          orderId,
          orderDate: new Date().toISOString(),
          items: emailItems,
          subtotal: Number(cart.subtotal || 0),
          tax: Number(
            (cart as any).tax ?? Math.max(cart.total - cart.subtotal, 0)
          ),
          total: Number(cart.total || 0),
          shippingAddress: {
            firstName: shipping.firstName || customerFirstName || "",
            lastName: shipping.lastName || customerLastName || "",
            address: shipping.address || "",
            city: shipping.city || "",
            postalCode: shipping.postalCode || "",
            country: shipping.country || "",
          },
        };

        await axios.post(
          `${SERVICES.email}/api/email/order-confirmation`,
          emailPayload,
          { headers: { "Content-Type": "application/json" } }
        );
      } catch (e) {
        console.warn("Email send failed (non-blocking)", (e as any)?.message);
      }

      // Nettoyer le mapping
      deleteCsidMapping(csid);
    }

    res.json({ received: true });
  } catch (error: any) {
    console.error(
      "handleStripeWebhook error:",
      error?.response?.data || error?.message
    );
    res.status(500).json({ error: "Webhook handling failed" });
  }
};

/**
 * Finaliser manuellement une commande si le webhook n'a pas tourné (dev/recovery)
 * Body: { csid: string }
 */
export const handleFinalizePayment = async (req: Request, res: Response) => {
  try {
    const { csid } = req.body || {};
    if (!csid) {
      res.status(400).json({ error: "csid is required" });
      return;
    }
    let cartSessionId = getSessionIdForCsid(csid);
    if (!cartSessionId) {
      cartSessionId = req.body?.cartSessionId;
    }
    if (!cartSessionId) {
      res.status(404).json({ error: "No session mapping found for csid" });
      return;
    }

    // Récupérer cart et snapshot
    const [cartResp, snapshotResp] = await Promise.all([
      axios.get(`${SERVICES.cart}/api/cart`, {
        params: { sessionId: cartSessionId },
      }),
      axios.get(`${SERVICES.cart}/api/cart/checkout`, {
        params: { sessionId: cartSessionId },
      }),
    ]);
    const cart = cartResp.data?.cart;
    const snapshot = snapshotResp.data?.snapshot;
    if (!cart || !snapshot) {
      res.status(404).json({ error: "Cart or snapshot not found" });
      return;
    }

    // Tenter de récupérer le payment_intent via Stripe Checkout Session (fallback si indispo)
    let paymentIntentId: string | null = null;
    try {
      const stripeKey = process.env["STRIPE_SECRET_KEY"];
      if (stripeKey) {
        const stripe = new StripeLib(stripeKey, { apiVersion: "2023-08-16" });
        const session = await stripe.checkout.sessions.retrieve(csid);
        paymentIntentId =
          typeof session.payment_intent === "string"
            ? (session.payment_intent as string)
            : session.payment_intent?.id || null;
      }
    } catch (e) {
      console.warn(
        "Finalize: unable to fetch payment_intent from Stripe, proceeding without it"
      );
    }

    // Charger les infos produits
    const productIdToInfo = new Map<
      number,
      { name: string; vatRate?: number }
    >();
    try {
      const productIds: number[] = (cart.items || [])
        .map((it: any) => Number(it.productId ?? it.product_id))
        .filter((id: number) => Number.isFinite(id) && id > 0);
      const uniqueIds = Array.from(new Set(productIds));
      await Promise.all(
        uniqueIds.map(async (pid) => {
          try {
            const r = await axios.get(
              `${SERVICES.product}/api/products/${pid}`
            );
            const p = r.data?.product || r.data;
            if (p) {
              const name = p.name || p.product?.name || "Produit";
              const vatRate = p.vatRate ?? p.product?.vatRate;
              productIdToInfo.set(pid, { name, vatRate });
            }
          } catch {}
        })
      );
    } catch {}

    // Résoudre customerId si absent
    let customerId: number | undefined =
      snapshot.customer?.customerId || snapshot.customerId;
    if (!customerId) {
      const customerEmail = snapshot.customer?.email || snapshot.email;
      if (customerEmail) {
        try {
          const resp = await axios.get(
            `${SERVICES.customer}/api/customers/by-email/${encodeURIComponent(
              customerEmail
            )}`
          );
          customerId = resp.data?.customer?.customerId;
        } catch {}
      }
    }

    // Construire payload
    const orderCreate = {
      customerId,
      customerSnapshot:
        snapshot.customer || snapshot.customerSnapshot || snapshot,
      totalAmountHT: cart.subtotal,
      totalAmountTTC: cart.total,
      paymentMethod: "stripe",
      notes: snapshot.notes || undefined,
    };
    const orderResp = await axios.post(
      `${SERVICES.order}/api/orders`,
      paymentIntentId ? { ...orderCreate, paymentIntentId } : orderCreate,
      { headers: { "Content-Type": "application/json" } }
    );
    const orderId = orderResp.data?.order?.id;

    // Items (robuste)
    for (const item of cart.items || []) {
      try {
        const pid = Number(item.productId ?? item.product_id);
        const rawVatAny =
          productIdToInfo.get(pid)?.vatRate ?? item.vatRate ?? item.vat_rate;
        const parsedVat = Number(rawVatAny);
        const vatRate =
          Number.isFinite(parsedVat) && parsedVat >= 0 ? parsedVat : 0;
        const vatMultiplier = 1 + vatRate / 100;
        const pInfo = productIdToInfo.get(pid);

        const quantity = Number(item.quantity) || 0;
        const unitPriceTTC = Number(item.price) || 0;
        const unitPriceHT = unitPriceTTC / vatMultiplier;
        const totalPriceTTC = unitPriceTTC * quantity;
        const totalPriceHT = totalPriceTTC / vatMultiplier;

        await axios.post(
          `${SERVICES.order}/api/orders/${orderId}/items`,
          {
            orderId: Number(orderId),
            productId: pid,
            productName: (
              pInfo?.name ||
              item.product_name ||
              "Produit"
            ).toString(),
            quantity,
            unitPriceHT,
            unitPriceTTC,
            vatRate,
            totalPriceHT,
            totalPriceTTC,
          },
          { headers: { "Content-Type": "application/json" } }
        );
      } catch (e: any) {
        console.warn(
          "Finalize: create order item failed (non-blocking):",
          e?.response?.data || e?.message
        );
      }
    }

    // Adresses
    const mkAddress = async (addressType: string, addressSnapshot: any) => {
      if (!addressSnapshot) return;
      await axios.post(
        `${SERVICES.order}/api/orders/${orderId}/addresses`,
        { orderId, addressType, addressSnapshot },
        { headers: { "Content-Type": "application/json" } }
      );
    };
    try {
      await mkAddress(
        "shipping",
        snapshot.shippingAddress || snapshot.shipping_address
      );
    } catch (e: any) {
      console.warn(
        "Finalize: create shipping address failed (non-blocking):",
        e?.response?.data || e?.message
      );
    }
    try {
      await mkAddress(
        "billing",
        snapshot.billingAddress || snapshot.billing_address
      );
    } catch (e: any) {
      console.warn(
        "Finalize: create billing address failed (non-blocking):",
        e?.response?.data || e?.message
      );
    }

    // Email non-bloquant (avec items + adresse)
    try {
      const shipping =
        snapshot.shippingAddress || snapshot.shipping_address || {};
      const customerFirstName =
        snapshot.customer?.firstName || shipping.firstName || "";
      const customerLastName =
        snapshot.customer?.lastName || shipping.lastName || "";

      const emailItems = (cart.items || []).map((item: any) => {
        const pid = Number(item.productId ?? item.product_id);
        const pInfo = productIdToInfo.get(pid);
        const name = (pInfo?.name || item.product_name || "Produit").toString();
        const unitPrice = Number(item.price);
        const quantity = Number(item.quantity);
        const totalPrice = unitPrice * quantity;
        const rawVatAny =
          productIdToInfo.get(pid)?.vatRate ?? item.vatRate ?? item.vat_rate;
        const parsedVat = Number(rawVatAny);
        const vatRate =
          Number.isFinite(parsedVat) && parsedVat >= 0 ? parsedVat : 21;
        return { name, quantity, unitPrice, totalPrice, vatRate };
      });

      const emailPayload = {
        customerEmail: snapshot.customer?.email || snapshot.email || "",
        customerName: `${customerFirstName} ${customerLastName}`.trim(),
        orderId,
        orderDate: new Date().toISOString(),
        items: emailItems,
        subtotal: Number(cart.subtotal || 0),
        tax: Number(
          (cart as any).tax ?? Math.max(cart.total - cart.subtotal, 0)
        ),
        total: Number(cart.total || 0),
        shippingAddress: {
          firstName: shipping.firstName || customerFirstName || "",
          lastName: shipping.lastName || customerLastName || "",
          address: shipping.address || "",
          city: shipping.city || "",
          postalCode: shipping.postalCode || "",
          country: shipping.country || "",
        },
      };

      await axios.post(
        `${SERVICES.email}/api/email/order-confirmation`,
        emailPayload,
        { headers: { "Content-Type": "application/json" } }
      );
    } catch {}

    res.status(200).json({ orderId });
  } catch (error: any) {
    console.error(
      "handleFinalizePayment error:",
      error?.response?.data || error?.message
    );
    res.status(500).json({ error: "Finalize failed" });
  }
};
