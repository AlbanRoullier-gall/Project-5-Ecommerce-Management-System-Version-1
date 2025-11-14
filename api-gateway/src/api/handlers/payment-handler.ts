import axios from "axios";
import { Request, Response } from "express";
import { SERVICES } from "../../config";
import { checkoutSnapshots } from "../controller/CartController";
// Use dynamic require to avoid type dependency at compile time
// eslint-disable-next-line @typescript-eslint/no-var-requires
const StripeLib: any = require("stripe");

/**
 * Handler pour finaliser un paiement après succès Stripe
 *
 * Rôle : Orchestration uniquement
 * - Récupère les données nécessaires (cart, snapshot, Stripe session)
 * - Délègue la transformation des données aux services appropriés
 * - Coordonne les appels aux services indépendants
 */

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
 * Récupère la session Stripe et extrait les informations nécessaires
 */
async function getStripeSessionInfo(csid: string): Promise<{
  session: any;
  paymentIntentId: string | undefined;
  cartSessionId: string | undefined;
}> {
  const stripeKey = process.env["STRIPE_SECRET_KEY"];
  if (!stripeKey) {
    throw new Error("STRIPE_SECRET_KEY not configured");
  }

  const stripe = new StripeLib(stripeKey, { apiVersion: "2023-08-16" });
  const session = await stripe.checkout.sessions.retrieve(csid);
  const paymentIntentId = extractPaymentIntentId(session) || undefined;
  const cartSessionId = session.metadata?.cartSessionId || undefined;

  return { session, paymentIntentId, cartSessionId };
}

/**
 * Récupère le cartSessionId depuis différentes sources
 */
function resolveCartSessionId(
  providedCartSessionId: string | undefined,
  csid: string,
  stripeSessionToCartSession?: Map<string, string>,
  stripeSession?: any
): string | null {
  // 1. Utiliser celui fourni directement
  if (providedCartSessionId) {
    return providedCartSessionId;
  }

  // 2. Essayer depuis le mapping en mémoire
  if (stripeSessionToCartSession) {
    const mapped = stripeSessionToCartSession.get(csid);
    if (mapped) return mapped;
  }

  // 3. Essayer depuis les métadonnées Stripe
  if (stripeSession?.metadata?.cartSessionId) {
    return stripeSession.metadata.cartSessionId;
  }

  return null;
}

/**
 * Récupère le panier depuis cart-service
 */
async function fetchCart(cartSessionId: string): Promise<any> {
  const response = await axios.get(`${SERVICES.cart}/api/cart`, {
    params: { sessionId: cartSessionId },
  });
  return response.data?.cart;
}

/**
 * Charge les noms de produits depuis product-service
 * Le cart contient déjà vatRate et price, on a juste besoin des noms
 */
async function loadProductNames(
  productIds: number[]
): Promise<Map<number, string>> {
  const productIdToName = new Map<number, string>();
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
          productIdToName.set(pid, name);
        }
      } catch (error) {
        // Ignore individual product fetch errors, utiliser "Produit" par défaut
      }
    })
  );

  return productIdToName;
}

/**
 * Résout le customerId depuis customer-service ou les metadata Stripe
 * Le snapshot ne contient pas toujours le customerId, on le résout depuis l'email
 */
async function resolveCustomerId(
  snapshot: any,
  stripeMetadata?: any
): Promise<number | undefined> {
  // 1. Essayer depuis le snapshot
  let customerId = snapshot.customer?.customerId || snapshot.customerId;
  if (customerId) return Number(customerId);

  // 2. Essayer depuis les metadata Stripe (le frontend l'y met)
  if (stripeMetadata?.customerId) {
    return Number(stripeMetadata.customerId);
  }

  // 3. Résoudre depuis l'email via customer-service
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
 * Prépare le payload pour order-service à partir du cart et snapshot
 * Utilise directement les données du cart (vatRate, price) et du snapshot (adresses, client)
 */
async function prepareOrderPayload(
  cart: any,
  snapshot: any,
  paymentIntentId?: string,
  stripeMetadata?: any
): Promise<any> {
  // Utiliser directement les items du cart (ils contiennent déjà vatRate et price)
  const cartItems = cart.items || [];

  // Charger uniquement les noms de produits depuis product-service
  const productIds = cartItems
    .map((item: any) => Number(item.productId ?? item.product_id))
    .filter((id: number) => Number.isFinite(id) && id > 0);
  const productNames = await loadProductNames(productIds);

  // Transformer les items en utilisant directement les données du cart
  const items = cartItems.map((item: any) => {
    const productId = Number(item.productId ?? item.product_id);
    const quantity = Number(item.quantity) || 0;
    const unitPriceTTC = Number(item.price) || 0; // Prix TTC unitaire depuis le cart
    const vatRate = Number(item.vatRate ?? item.vat_rate ?? 0); // TVA depuis le cart
    const vatMultiplier = 1 + vatRate / 100;
    const unitPriceHT = unitPriceTTC / vatMultiplier; // Calcul HT
    const totalPriceTTC = unitPriceTTC * quantity; // Total TTC
    const totalPriceHT = totalPriceTTC / vatMultiplier; // Total HT

    return {
      productId,
      productName: productNames.get(productId) || "Produit",
      quantity,
      unitPriceHT,
      unitPriceTTC,
      vatRate,
      totalPriceHT,
      totalPriceTTC,
    };
  });

  // Résoudre customerId depuis snapshot ou metadata Stripe
  const customerId = await resolveCustomerId(snapshot, stripeMetadata);

  // Extraire les adresses directement depuis le snapshot
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

  // Construire le payload pour order-service
  const payload: any = {
    totalAmountHT: cart.subtotal || 0, // Utiliser directement le subtotal du cart
    totalAmountTTC: cart.total || 0, // Utiliser directement le total du cart
    paymentMethod: "stripe",
    notes: snapshot.notes || undefined,
    items,
    addresses: addresses.length > 0 ? addresses : undefined,
  };

  // Ajouter customerId si disponible
  if (customerId) {
    payload.customerId = customerId;
  }

  // Ajouter customerSnapshot (order-service l'accepte si customerId n'est pas disponible)
  const customerSnapshot =
    snapshot.customer || snapshot.customerSnapshot || snapshot;
  if (customerSnapshot) {
    payload.customerSnapshot = customerSnapshot;
  }

  // Ajouter paymentIntentId pour l'idempotence
  if (paymentIntentId) {
    payload.paymentIntentId = paymentIntentId;
  }

  return payload;
}

/**
 * Crée la commande via order-service
 */
async function createOrder(payload: any): Promise<number> {
  const response = await axios.post(
    `${SERVICES.order}/api/orders/from-checkout`,
    payload,
    { headers: { "Content-Type": "application/json" } }
  );
  return response.data?.order?.id;
}

/**
 * Prépare le payload pour email-service à partir du cart et snapshot
 * Utilise directement les données du cart et du snapshot
 */
async function prepareEmailPayload(
  orderId: number,
  cart: any,
  snapshot: any
): Promise<any> {
  const customer = snapshot.customer || {};
  const shipping = snapshot.shippingAddress || snapshot.shipping_address || {};

  // Utiliser directement les items du cart
  const cartItems = cart.items || [];

  // Charger les noms de produits pour l'email
  const productIds = cartItems
    .map((item: any) => Number(item.productId ?? item.product_id))
    .filter((id: number) => Number.isFinite(id) && id > 0);
  const productNames = await loadProductNames(productIds);

  // Transformer les items pour email-service en utilisant les données du cart
  const items = cartItems.map((item: any) => ({
    name:
      productNames.get(Number(item.productId ?? item.product_id)) || "Produit",
    quantity: Number(item.quantity) || 0,
    unitPrice: Number(item.price) || 0, // Prix TTC unitaire depuis le cart
    totalPrice: Number(item.price) * (Number(item.quantity) || 0), // Total TTC
    vatRate: Number(item.vatRate ?? item.vat_rate ?? 21), // TVA depuis le cart
  }));

  return {
    customerEmail: customer.email || snapshot.email || "",
    customerName: `${customer.firstName || shipping.firstName || ""} ${
      customer.lastName || shipping.lastName || ""
    }`.trim(),
    orderId,
    orderDate: new Date().toISOString(),
    items,
    subtotal: Number(cart.subtotal || 0), // Utiliser directement le subtotal du cart
    tax: Number((cart as any).tax ?? Math.max(cart.total - cart.subtotal, 0)), // Taxe depuis le cart
    total: Number(cart.total || 0), // Utiliser directement le total du cart
    shippingAddress: {
      firstName: shipping.firstName || customer.firstName || "",
      lastName: shipping.lastName || customer.lastName || "",
      address: shipping.address || "",
      city: shipping.city || "",
      postalCode: shipping.postalCode || "",
      country: shipping.country || "",
    },
  };
}

/**
 * Envoie l'email de confirmation via email-service
 */
async function sendOrderConfirmationEmail(payload: any): Promise<void> {
  await axios.post(`${SERVICES.email}/api/email/order-confirmation`, payload, {
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Finaliser un paiement après succès Stripe
 *
 * Orchestration simple :
 * 1. Récupère les données (Stripe session, cart, snapshot)
 * 2. Prépare les payloads pour les services
 * 3. Appelle order-service pour créer la commande
 * 4. Appelle email-service pour envoyer l'email
 */
export const handleFinalizePayment = async (
  req: Request,
  res: Response,
  stripeSessionToCartSession?: Map<string, string>
) => {
  try {
    let { csid, cartSessionId } = req.body || {};
    console.log(
      `[handleFinalizePayment] Received: csid=${csid}, cartSessionId=${cartSessionId}`
    );

    // Validation
    if (!csid) {
      return res.status(400).json({ error: "csid is required" });
    }

    // 1. Récupérer la session Stripe
    let stripeSessionInfo;
    try {
      stripeSessionInfo = await getStripeSessionInfo(csid);
    } catch (e) {
      console.warn(
        "[handleFinalizePayment] Unable to fetch Stripe session:",
        (e as any)?.message
      );
      // Continue sans paymentIntentId si nécessaire
      stripeSessionInfo = { session: null, paymentIntentId: undefined };
    }

    // 2. Résoudre le cartSessionId
    const resolvedCartSessionId = resolveCartSessionId(
      cartSessionId,
      csid,
      stripeSessionToCartSession,
      stripeSessionInfo.session
    );

    if (!resolvedCartSessionId) {
      return res.status(400).json({
        error: "cartSessionId is required (provide it or ensure csid is valid)",
      });
    }

    // 3. Récupérer le snapshot et le cart
    const snapshot = checkoutSnapshots.get(resolvedCartSessionId);
    if (!snapshot) {
      return res.status(404).json({ error: "Checkout snapshot not found" });
    }

    const cart = await fetchCart(resolvedCartSessionId);
    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    // 4. Créer la commande via order-service
    console.log(`[handleFinalizePayment] Creating order...`);
    const orderPayload = await prepareOrderPayload(
      cart,
      snapshot,
      stripeSessionInfo.paymentIntentId,
      stripeSessionInfo.session?.metadata
    );
    const orderId = await createOrder(orderPayload);
    console.log(
      `[handleFinalizePayment] Order created successfully: ${orderId}`
    );

    // 5. Envoyer l'email via email-service (non-bloquant)
    try {
      const emailPayload = await prepareEmailPayload(orderId, cart, snapshot);
      await sendOrderConfirmationEmail(emailPayload);
      console.log(`[handleFinalizePayment] Email sent successfully`);
    } catch (error) {
      console.warn(
        "Email send failed (non-blocking):",
        (error as any)?.message
      );
    }

    return res.status(200).json({ orderId, success: true });
  } catch (error: any) {
    console.error(
      "handleFinalizePayment error:",
      error?.response?.data || error?.message
    );
    return res.status(500).json({
      error: "Finalize failed",
      message: error?.message || "Internal server error",
    });
  }
};
