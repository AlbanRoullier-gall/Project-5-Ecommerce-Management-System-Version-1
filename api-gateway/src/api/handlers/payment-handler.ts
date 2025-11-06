import axios from "axios";
import { Request, Response } from "express";
import { SERVICES } from "../../config";
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
export const checkoutSnapshots = new Map<string, any>();

// Types utilitaires
interface ProductInfo {
  name: string;
  vatRate: number;
}

interface OrderItem {
  productId?: number;
  product_id?: number;
  quantity: number;
  price: number;
  vatRate?: number;
  vat_rate?: number;
  product_name?: string;
}

// ===== FONCTIONS UTILITAIRES =====

/**
 * Charge les informations produits depuis le product-service
 */
async function loadProductInfo(
  productIds: number[]
): Promise<Map<number, ProductInfo>> {
  const productIdToInfo = new Map<number, ProductInfo>();
  const uniqueIds = Array.from(
    new Set(productIds.filter((id) => Number.isFinite(id) && id > 0))
  );

  await Promise.all(
    uniqueIds.map(async (pid) => {
      try {
        const response = await axios.get(
          `${SERVICES.product}/api/products/${pid}`
        );
        const product = response.data?.product || response.data;
        if (product) {
          const name = product.name || product.product?.name || "Produit";
          const rawVat = product.vatRate ?? product.product?.vatRate;
          const parsedVat = Number(rawVat);
          const vatRate =
            Number.isFinite(parsedVat) && parsedVat >= 0 ? parsedVat : 0;
          productIdToInfo.set(pid, { name, vatRate });
        }
      } catch (error) {
        // Ignore individual product fetch errors
      }
    })
  );

  return productIdToInfo;
}

/**
 * Résout le customerId depuis l'email si nécessaire
 */
async function resolveCustomerId(snapshot: any): Promise<number | undefined> {
  let customerId = snapshot.customer?.customerId || snapshot.customerId;
  if (customerId) return customerId;

  const customerEmail = snapshot.customer?.email || snapshot.email;
  if (!customerEmail) return undefined;

  try {
    const response = await axios.get(
      `${SERVICES.customer}/api/customers/by-email/${encodeURIComponent(
        customerEmail
      )}`
    );
    return response.data?.customer?.customerId;
  } catch (error) {
    return undefined;
  }
}

/**
 * Extrait le payment intent ID depuis une session Stripe
 */
function extractPaymentIntentId(session: any): string {
  if (typeof session.payment_intent === "string") {
    return session.payment_intent;
  }
  return session.payment_intent?.id || "";
}

/**
 * Calcule les prix HT et TTC pour un item
 */
function calculateItemPrices(item: OrderItem, vatRate: number) {
  const quantity = Number(item.quantity) || 0;
  const unitPriceTTC = Number(item.price) || 0;
  const vatMultiplier = 1 + vatRate / 100;
  const unitPriceHT = unitPriceTTC / vatMultiplier;
  const totalPriceTTC = unitPriceTTC * quantity;
  const totalPriceHT = totalPriceTTC / vatMultiplier;

  return {
    quantity,
    unitPriceHT,
    unitPriceTTC,
    totalPriceHT,
    totalPriceTTC,
    vatRate,
  };
}

// Note: Les fonctions createOrderItem et createOrderAddresses ont été supprimées
// car elles ne sont plus nécessaires - tout est créé en une transaction via /api/orders/from-checkout

/**
 * Envoie l'email de confirmation de commande
 */
async function sendOrderConfirmationEmail(
  orderId: number,
  cart: any,
  snapshot: any,
  items: OrderItem[],
  productInfo: Map<number, ProductInfo>
): Promise<void> {
  const shipping = snapshot.shippingAddress || snapshot.shipping_address || {};
  const customerFirstName =
    snapshot.customer?.firstName || shipping.firstName || "";
  const customerLastName =
    snapshot.customer?.lastName || shipping.lastName || "";

  const emailItems = items.map((item) => {
    const productId = Number(item.productId ?? item.product_id);
    const pInfo = productInfo.get(productId);
    const rawVat = pInfo?.vatRate ?? item.vatRate ?? item.vat_rate;
    const parsedVat = Number(rawVat);
    const vatRate =
      Number.isFinite(parsedVat) && parsedVat >= 0 ? parsedVat : 21;

    return {
      name: (pInfo?.name || item.product_name || "Produit").toString(),
      quantity: Number(item.quantity),
      unitPrice: Number(item.price),
      totalPrice: Number(item.price) * Number(item.quantity),
      vatRate,
    };
  });

  const emailPayload = {
    customerEmail: snapshot.customer?.email || snapshot.email || "",
    customerName: `${customerFirstName} ${customerLastName}`.trim(),
    orderId,
    orderDate: new Date().toISOString(),
    items: emailItems,
    subtotal: Number(cart.subtotal || 0),
    tax: Number((cart as any).tax ?? Math.max(cart.total - cart.subtotal, 0)),
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
}

/**
 * Traite la création complète d'une commande (ordre + items + adresses + email)
 * Utilise le nouvel endpoint /api/orders/from-checkout pour créer tout en une transaction atomique
 */
async function processOrderCreation(
  cart: any,
  snapshot: any,
  paymentIntentId?: string
): Promise<number> {
  // Résoudre customerId
  const customerId = await resolveCustomerId(snapshot);

  // Charger les infos produits
  const sourceItems: OrderItem[] = Array.isArray(snapshot?.items)
    ? snapshot.items
    : cart.items || [];
  const productIds = sourceItems
    .map((item) => Number(item.productId ?? item.product_id))
    .filter((id) => Number.isFinite(id) && id > 0);
  const productInfo = await loadProductInfo(productIds);

  // Préparer les items avec les prix calculés
  const orderItems = sourceItems.map((item) => {
    const productId = Number(item.productId ?? item.product_id);
    const pInfo = productInfo.get(productId);
    const rawVat = pInfo?.vatRate ?? item.vatRate ?? item.vat_rate;
    const parsedVat = Number(rawVat);
    const vatRate =
      Number.isFinite(parsedVat) && parsedVat >= 0 ? parsedVat : 0;

    const prices = calculateItemPrices(item, vatRate);
    const productName = (
      pInfo?.name ||
      item.product_name ||
      "Produit"
    ).toString();

    return {
      productId,
      productName,
      quantity: prices.quantity,
      unitPriceHT: prices.unitPriceHT,
      unitPriceTTC: prices.unitPriceTTC,
      vatRate: prices.vatRate,
      totalPriceHT: prices.totalPriceHT,
      totalPriceTTC: prices.totalPriceTTC,
    };
  });

  // Préparer les adresses
  const addresses = [];
  const shippingAddress = snapshot.shippingAddress || snapshot.shipping_address;
  const billingAddress = snapshot.billingAddress || snapshot.billing_address;

  if (shippingAddress) {
    addresses.push({
      addressType: "shipping",
      addressSnapshot: shippingAddress,
    });
  }
  if (billingAddress) {
    addresses.push({
      addressType: "billing",
      addressSnapshot: billingAddress,
    });
  }

  // Créer la commande complète en une seule transaction atomique
  const checkoutPayload: any = {
    customerId,
    customerSnapshot:
      snapshot.customer || snapshot.customerSnapshot || snapshot,
    totalAmountHT: cart.subtotal,
    totalAmountTTC: cart.total,
    paymentMethod: "stripe",
    notes: snapshot.notes || undefined,
    items: orderItems,
    addresses: addresses.length > 0 ? addresses : undefined,
  };
  if (paymentIntentId) {
    checkoutPayload.paymentIntentId = paymentIntentId;
  }

  const orderResponse = await axios.post(
    `${SERVICES.order}/api/orders/from-checkout`,
    checkoutPayload,
    { headers: { "Content-Type": "application/json" } }
  );
  const orderId = orderResponse.data?.order?.id;

  // Envoyer l'email (non-bloquant)
  try {
    await sendOrderConfirmationEmail(
      orderId,
      cart,
      snapshot,
      sourceItems,
      productInfo
    );
  } catch (error) {
    console.warn("Email send failed (non-blocking):", (error as any)?.message);
  }

  return orderId;
}

// ===== HANDLERS =====

export const handleCreatePayment = async (req: Request, res: Response) => {
  try {
    const { cartSessionId, snapshot, payment } = req.body || {};
    if (!cartSessionId || !snapshot || !payment) {
      return res
        .status(400)
        .json({ error: "cartSessionId, snapshot, payment are required" });
    }

    // Stocker le snapshot dans l'API Gateway
    checkoutSnapshots.set(cartSessionId, snapshot);

    // Forcer l'ajout du placeholder csid dans les URLs de redirection
    const ensureCsid = (url: string) =>
      url.includes("{CHECKOUT_SESSION_ID}")
        ? url
        : url + (url.includes("?") ? "&" : "?") + "csid={CHECKOUT_SESSION_ID}";

    // Créer la session Stripe via payment-service
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

    return res.status(201).json({ url, checkoutSessionId });
  } catch (error: any) {
    console.error(
      "handleCreatePayment error:",
      error?.response?.data || error?.message
    );
    return res.status(500).json({ error: "Payment creation failed" });
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

  // Vérifier la signature
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
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as any;
      const csid = session.id;
      const paymentIntentId = extractPaymentIntentId(session);

      // Retrouver le cartSessionId depuis notre mémoire côté Gateway
      const cartSessionId = getSessionIdForCsid(csid);
      if (!cartSessionId) {
        console.warn("No cartSessionId mapping found for csid:", csid);
        return res.json({ received: true });
      }

      // Récupérer cart et snapshot
      const cartResp = await axios.get(`${SERVICES.cart}/api/cart`, {
        params: { sessionId: cartSessionId },
      });
      const cart = cartResp.data?.cart;
      const snapshot = checkoutSnapshots.get(cartSessionId);

      if (!cart || !snapshot) {
        console.error("Missing cart or snapshot for session:", cartSessionId);
        return res.json({ received: true });
      }

      // Traiter la création de commande
      await processOrderCreation(cart, snapshot, paymentIntentId);

      // Nettoyer le mapping
      deleteCsidMapping(csid);
    }

    return res.json({ received: true });
  } catch (error: any) {
    console.error(
      "handleStripeWebhook error:",
      error?.response?.data || error?.message
    );
    return res.status(500).json({ error: "Webhook handling failed" });
  }
};

/**
 * Finaliser manuellement une commande si le webhook n'a pas tourné (dev/recovery)
 * Body: { csid: string, cartSessionId?: string }
 */
export const handleFinalizePayment = async (req: Request, res: Response) => {
  try {
    const { csid } = req.body || {};
    if (!csid) {
      return res.status(400).json({ error: "csid is required" });
    }

    // Retrouver le cartSessionId
    let cartSessionId = getSessionIdForCsid(csid) || req.body?.cartSessionId;
    if (!cartSessionId) {
      return res
        .status(404)
        .json({ error: "No session mapping found for csid" });
    }

    // Récupérer cart et snapshot
    const cartResp = await axios.get(`${SERVICES.cart}/api/cart`, {
      params: { sessionId: cartSessionId },
    });
    const cart = cartResp.data?.cart;
    const snapshot = checkoutSnapshots.get(cartSessionId);
    if (!cart || !snapshot) {
      return res.status(404).json({ error: "Cart or snapshot not found" });
    }

    // Tenter de récupérer le payment_intent via Stripe (fallback si indispo)
    let paymentIntentId: string | undefined;
    try {
      const stripeKey = process.env["STRIPE_SECRET_KEY"];
      if (stripeKey) {
        const stripe = new StripeLib(stripeKey, { apiVersion: "2023-08-16" });
        const session = await stripe.checkout.sessions.retrieve(csid);
        paymentIntentId = extractPaymentIntentId(session) || undefined;
      }
    } catch (e) {
      console.warn(
        "Finalize: unable to fetch payment_intent from Stripe, proceeding without it"
      );
    }

    // Traiter la création de commande
    const orderId = await processOrderCreation(cart, snapshot, paymentIntentId);

    return res.status(200).json({ orderId });
  } catch (error: any) {
    console.error(
      "handleFinalizePayment error:",
      error?.response?.data || error?.message
    );
    return res.status(500).json({ error: "Finalize failed" });
  }
};
