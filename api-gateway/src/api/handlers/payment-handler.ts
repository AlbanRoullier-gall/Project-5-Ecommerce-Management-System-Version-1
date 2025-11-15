import axios from "axios";
import { Request, Response } from "express";
import { SERVICES } from "../../config";
import { checkoutSnapshots } from "../controller/CartController";
// Use dynamic require to avoid type dependency at compile time
// eslint-disable-next-line @typescript-eslint/no-var-requires
const StripeLib: any = require("stripe");

/**
 * ============================================================================
 * PAYMENT HANDLER - Finalisation de paiement après succès Stripe
 * ============================================================================
 *
 * Rôle : Orchestration de la finalisation du paiement
 * - Récupère les données nécessaires (session Stripe, panier, snapshot checkout)
 * - Transforme et valide les données
 * - Coordonne les appels aux services (order-service, email-service)
 * - Gère les erreurs et l'idempotence
 *
 * Flux principal :
 * 1. Récupération session Stripe → paymentIntentId (pour idempotence) + métadonnées
 * 2. Résolution cartSessionId → identifier le panier et le snapshot
 * 3. Récupération données → snapshot (customer, adresses) + cart (items, totaux)
 * 4. Transformation données → format attendu par order-service
 * 5. Création commande → appel order-service
 * 6. Envoi email → appel email-service (non-bloquant)
 */

// ============================================================================
// SECTION 1 : UTILITIES STRIPE
// ============================================================================

/**
 * Extrait le payment intent ID depuis une session Stripe
 *
 * Le paymentIntentId est utilisé pour l'idempotence : si une commande avec
 * le même paymentIntentId existe déjà, elle n'est pas dupliquée.
 *
 * @param session - Session Stripe récupérée via l'API
 * @returns Le payment intent ID (string) ou chaîne vide si absent
 */
function extractPaymentIntentId(session: any): string {
  // Stripe peut retourner payment_intent comme string ou comme objet
  if (typeof session.payment_intent === "string") {
    return session.payment_intent;
  }
  return session.payment_intent?.id || "";
}

/**
 * Récupère la session Stripe complète depuis l'API Stripe
 *
 * Cette fonction est nécessaire pour :
 * - Extraire le paymentIntentId (idempotence)
 * - Accéder aux métadonnées Stripe (notamment customerId mis par le frontend)
 *
 * @param csid - Checkout Session ID (retourné par Stripe après paiement)
 * @returns Session Stripe complète + paymentIntentId extrait
 * @throws Error si STRIPE_SECRET_KEY n'est pas configuré
 */
async function getStripeSessionInfo(csid: string): Promise<{
  session: any;
  paymentIntentId: string | undefined;
}> {
  const stripeKey = process.env["STRIPE_SECRET_KEY"];
  if (!stripeKey) {
    throw new Error("STRIPE_SECRET_KEY not configured");
  }

  const stripe = new StripeLib(stripeKey, { apiVersion: "2023-08-16" });
  const session = await stripe.checkout.sessions.retrieve(csid);
  const paymentIntentId = extractPaymentIntentId(session) || undefined;

  return { session, paymentIntentId };
}

// ============================================================================
// SECTION 2 : RÉCUPÉRATION ET TRANSFORMATION DU PANIER
// ============================================================================

/**
 * Résout le cartSessionId depuis différentes sources (avec sources de secours)
 *
 * Le cartSessionId est nécessaire pour :
 * - Récupérer le panier depuis cart-service
 * - Récupérer le snapshot checkout depuis la Map en mémoire
 *
 * Note : En pratique, le cartSessionId est toujours fourni directement par le frontend.
 * Les sources de secours sont conservées pour robustesse.
 *
 * @param providedCartSessionId - cartSessionId fourni dans le body de la requête
 * @param csid - Checkout Session ID Stripe
 * @param stripeSessionToCartSession - Map en mémoire (csid → cartSessionId) - source de secours
 * @param stripeSession - Session Stripe (pour accéder aux métadonnées) - source de secours
 * @returns cartSessionId résolu ou null si aucune source ne fonctionne
 */
function resolveCartSessionId(
  providedCartSessionId: string | undefined,
  csid: string,
  stripeSessionToCartSession?: Map<string, string>,
  stripeSession?: any
): string | null {
  // Source principale : celui fourni directement (toujours présent en pratique)
  if (providedCartSessionId) {
    return providedCartSessionId;
  }

  // Sources de secours (au cas où le frontend oublierait de l'envoyer)
  if (stripeSessionToCartSession) {
    const mapped = stripeSessionToCartSession.get(csid);
    if (mapped) return mapped;
  }

  if (stripeSession?.metadata?.cartSessionId) {
    return stripeSession.metadata.cartSessionId;
  }

  return null;
}

/**
 * Récupère le panier depuis cart-service
 *
 * Le panier contient :
 * - Les items avec leurs quantités, prix, TVA
 * - Les totaux (subtotal, tax, total)
 *
 * @param cartSessionId - Identifiant de session du panier
 * @returns Le panier complet ou null si introuvable
 */
async function fetchCart(cartSessionId: string): Promise<any> {
  const response = await axios.get(`${SERVICES.cart}/api/cart`, {
    params: { sessionId: cartSessionId },
  });
  const cart = response.data?.cart;

  // Debug: vérifier si productName est présent dans les items
  if (cart?.items) {
    console.log(
      "[fetchCart] Cart items:",
      cart.items.map((item: any) => ({
        productId: item.productId,
        productName: item.productName,
        hasProductName: !!item.productName,
      }))
    );
  }

  return cart;
}

/**
 * Normalise un item du panier en format standardisé
 *
 * Gère les différents formats de propriétés possibles (snake_case vs camelCase)
 * et fournit des valeurs par défaut si manquantes.
 *
 * @param item - Item du panier (format variable selon la source)
 * @returns Item normalisé avec propriétés garanties
 */
function normalizeCartItem(item: any): {
  productId: number;
  productName: string;
  quantity: number;
  unitPriceTTC: number;
  vatRate: number;
} {
  const productId = Number(item.productId ?? item.product_id);
  const quantity = Number(item.quantity) || 0;
  const unitPriceTTC = Number(item.price) || 0;
  const vatRate = Number(item.vatRate ?? item.vat_rate ?? 0);
  const productName = item.productName || `Produit #${productId}`;

  return {
    productId,
    productName,
    quantity,
    unitPriceTTC,
    vatRate,
  };
}

/**
 * Transforme un item du panier avec calculs HT/TTC complets
 *
 * Calcule les prix HT à partir des prix TTC et ajoute les totaux par item.
 * Utilisé pour préparer le payload de commande.
 *
 * @param item - Item du panier (format variable)
 * @returns Item transformé avec tous les calculs (HT, TTC, totaux)
 */
function transformCartItem(item: any): {
  productId: number;
  productName: string;
  quantity: number;
  unitPriceTTC: number;
  vatRate: number;
  unitPriceHT: number;
  totalPriceTTC: number;
  totalPriceHT: number;
} {
  const normalized = normalizeCartItem(item);
  const vatMultiplier = 1 + normalized.vatRate / 100;
  const unitPriceHT = normalized.unitPriceTTC / vatMultiplier;
  const totalPriceTTC = normalized.unitPriceTTC * normalized.quantity;
  const totalPriceHT = totalPriceTTC / vatMultiplier;

  return {
    ...normalized,
    unitPriceHT,
    totalPriceTTC,
    totalPriceHT,
  };
}

// ============================================================================
// SECTION 3 : EXTRACTION DES DONNÉES DU SNAPSHOT
// ============================================================================

// Note: extractCustomerInfo et extractAddresses sont des fonctions très simples
// qui sont inlinées directement dans prepareOrderPayload et prepareEmailPayload
// pour éviter des appels de fonctions inutiles

/**
 * Résout le customerId depuis les métadonnées Stripe ou l'email
 *
 * Le customerId est nécessaire pour lier la commande au client dans la base.
 * Sources (par ordre de priorité) :
 * 1. Métadonnées Stripe (le frontend y met customerId lors de la création du paiement)
 * 2. Résolution par email via customer-service (si customerId absent des métadonnées)
 *
 * @param snapshot - Snapshot checkout contenant l'email du client
 * @param stripeMetadata - Métadonnées de la session Stripe
 * @returns customerId résolu ou undefined si impossible
 */
async function resolveCustomerId(
  snapshot: any,
  stripeMetadata?: any
): Promise<number | undefined> {
  // Source principale : metadata Stripe (le frontend l'y met lors de la création du paiement)
  if (stripeMetadata?.customerId) {
    return Number(stripeMetadata.customerId);
  }

  // Source de secours : résoudre depuis l'email via customer-service
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

// ============================================================================
// SECTION 4 : PRÉPARATION ET CRÉATION DE COMMANDE
// ============================================================================

/**
 * Prépare le payload pour order-service à partir du cart et snapshot
 *
 * Combine les données du panier (items, totaux) et du snapshot (customer, adresses)
 * pour créer un payload complet pour order-service.
 *
 * Structure du payload :
 * - Totaux (HT/TTC) depuis le cart
 * - Items transformés avec calculs HT/TTC
 * - Adresses depuis le snapshot
 * - customerId résolu
 * - customerSnapshot (fallback si customerId absent)
 * - paymentIntentId (pour idempotence)
 *
 * @param cart - Panier complet avec items et totaux
 * @param snapshot - Snapshot checkout avec customer et adresses
 * @param paymentIntentId - ID du payment intent Stripe (pour idempotence)
 * @param stripeMetadata - Métadonnées Stripe (contient customerId)
 * @returns Payload formaté pour order-service
 */
async function prepareOrderPayload(
  cart: any,
  snapshot: any,
  paymentIntentId?: string,
  stripeMetadata?: any
): Promise<any> {
  const cartItems = cart.items || [];

  // Debug: vérifier les productName dans les items
  console.log(
    "[prepareOrderPayload] Cart items with productName:",
    cartItems.map((item: any) => ({
      productId: item.productId ?? item.product_id,
      productName: item.productName,
      hasProductName: !!item.productName,
    }))
  );

  // Transformer les items : normaliser + calculer HT/TTC
  const items = cartItems.map((item: any) => {
    const transformed = transformCartItem(item);
    console.log(
      `[prepareOrderPayload] Item ${transformed.productId}: productName="${transformed.productName}"`
    );
    return transformed;
  });

  // Résoudre customerId depuis métadonnées Stripe ou email
  const customerId = await resolveCustomerId(snapshot, stripeMetadata);

  // Extraire les adresses depuis le snapshot (gère camelCase et snake_case)
  const shippingAddress = snapshot.shippingAddress || snapshot.shipping_address;
  const billingAddress = snapshot.billingAddress || snapshot.billing_address;
  const addresses = [];
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
    totalAmountHT: cart.subtotal || 0,
    totalAmountTTC: cart.total || 0,
    paymentMethod: "stripe",
    notes: snapshot.notes || undefined,
    items,
    addresses: addresses.length > 0 ? addresses : undefined,
  };

  // Ajouter customerId si disponible (priorité)
  if (customerId) {
    payload.customerId = customerId;
  }

  // Ajouter customerSnapshot (fallback si customerId absent - order-service l'accepte)
  const customerSnapshot =
    snapshot.customer || snapshot.customerSnapshot || snapshot;
  if (customerSnapshot) {
    payload.customerSnapshot = customerSnapshot;
  }

  // Ajouter paymentIntentId pour l'idempotence (évite les doublons en cas de retry)
  if (paymentIntentId) {
    payload.paymentIntentId = paymentIntentId;
  }

  return payload;
}

/**
 * Crée la commande via order-service
 *
 * Envoie le payload préparé à order-service qui :
 * - Crée la commande dans la base de données
 * - Utilise paymentIntentId pour l'idempotence (si même paymentIntentId, pas de doublon)
 * - Retourne l'ID de la commande créée
 *
 * @param payload - Payload formaté pour order-service
 * @returns ID de la commande créée
 */
async function createOrder(payload: any): Promise<number> {
  const response = await axios.post(
    `${SERVICES.order}/api/orders/from-checkout`,
    payload,
    { headers: { "Content-Type": "application/json" } }
  );
  return response.data?.order?.id;
}

// ============================================================================
// SECTION 5 : PRÉPARATION ET ENVOI D'EMAIL
// ============================================================================

/**
 * Prépare le payload pour email-service à partir du cart et snapshot
 *
 * Format les données pour l'email de confirmation de commande.
 * Utilise les données normalisées (pas besoin des calculs HT complets pour l'email).
 *
 * @param orderId - ID de la commande créée
 * @param cart - Panier avec items et totaux
 * @param snapshot - Snapshot avec customer et adresses
 * @returns Payload formaté pour email-service
 */
async function prepareEmailPayload(
  orderId: number,
  cart: any,
  snapshot: any
): Promise<any> {
  // Extraire les informations customer et adresses directement depuis le snapshot
  const customer = snapshot.customer || {};
  const email = customer.email || snapshot.email || "";
  const shipping = snapshot.shippingAddress || snapshot.shipping_address;

  // Normaliser les items (pas besoin des calculs HT pour l'email)
  const cartItems = cart.items || [];
  const items = cartItems.map((item: any) => {
    const normalized = normalizeCartItem(item);
    return {
      name: normalized.productName,
      quantity: normalized.quantity,
      unitPrice: normalized.unitPriceTTC,
      totalPrice: normalized.unitPriceTTC * normalized.quantity,
      vatRate: normalized.vatRate,
    };
  });

  return {
    customerEmail: email,
    customerName: `${customer.firstName || shipping?.firstName || ""} ${
      customer.lastName || shipping?.lastName || ""
    }`.trim(),
    orderId,
    orderDate: new Date().toISOString(),
    items,
    subtotal: Number(cart.subtotal || 0),
    tax: Number((cart as any).tax ?? Math.max(cart.total - cart.subtotal, 0)),
    total: Number(cart.total || 0),
    shippingAddress: {
      firstName: shipping?.firstName || customer.firstName || "",
      lastName: shipping?.lastName || customer.lastName || "",
      address: shipping?.address || "",
      city: shipping?.city || "",
      postalCode: shipping?.postalCode || "",
      country: shipping?.country || "",
    },
  };
}

/**
 * Envoie l'email de confirmation via email-service
 *
 * Cette opération est non-bloquante : si elle échoue, la commande reste créée.
 * L'erreur est loggée mais n'empêche pas la finalisation du paiement.
 *
 * @param payload - Payload formaté pour email-service
 */
async function sendOrderConfirmationEmail(payload: any): Promise<void> {
  await axios.post(`${SERVICES.email}/api/email/order-confirmation`, payload, {
    headers: { "Content-Type": "application/json" },
  });
}

// ============================================================================
// SECTION 6 : HANDLER PRINCIPAL - ORCHESTRATION
// ============================================================================

/**
 * Handler principal : Finalise un paiement après succès Stripe
 *
 * Orchestration complète du processus de finalisation :
 * 1. Récupère la session Stripe (paymentIntentId + métadonnées)
 * 2. Résout le cartSessionId (identifie panier et snapshot)
 * 3. Récupère le snapshot (customer, adresses) et le cart (items, totaux)
 * 4. Prépare le payload pour order-service
 * 5. Crée la commande via order-service
 * 6. Envoie l'email de confirmation (non-bloquant)
 *
 * Gestion d'erreurs :
 * - Si récupération Stripe échoue → continue sans paymentIntentId (perte d'idempotence)
 * - Si snapshot/cart introuvable → erreur 404
 * - Si création commande échoue → erreur 500
 * - Si envoi email échoue → loggée mais non-bloquante
 *
 * @param req - Requête Express avec body { csid, cartSessionId }
 * @param res - Réponse Express
 * @param stripeSessionToCartSession - Map optionnelle (csid → cartSessionId) pour sources de secours
 * @returns Réponse JSON avec { orderId, success: true } ou erreur
 */
export const handleFinalizePayment = async (
  req: Request,
  res: Response,
  stripeSessionToCartSession?: Map<string, string>
) => {
  try {
    const { csid, cartSessionId } = req.body || {};
    console.log(
      `[handleFinalizePayment] Received: csid=${csid}, cartSessionId=${cartSessionId}`
    );

    // Validation des paramètres requis
    if (!csid) {
      return res.status(400).json({ error: "csid is required" });
    }

    // ===== ÉTAPE 1 : Récupérer la session Stripe =====
    // Nécessaire pour paymentIntentId (idempotence) et métadonnées (customerId)
    let stripeSessionInfo;
    try {
      stripeSessionInfo = await getStripeSessionInfo(csid);
    } catch (e) {
      console.warn(
        "[handleFinalizePayment] Unable to fetch Stripe session:",
        (e as any)?.message
      );
      // Continue sans paymentIntentId si nécessaire (perte d'idempotence mais processus continue)
      stripeSessionInfo = { session: null, paymentIntentId: undefined };
    }

    // ===== ÉTAPE 2 : Résoudre le cartSessionId =====
    // Identifie le panier et le snapshot à utiliser
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

    // ===== ÉTAPE 3 : Récupérer le snapshot et le cart =====
    // Snapshot : données checkout (customer, adresses) stockées en mémoire
    const snapshot = checkoutSnapshots.get(resolvedCartSessionId);
    if (!snapshot) {
      return res.status(404).json({ error: "Checkout snapshot not found" });
    }

    // Cart : panier avec items et totaux depuis cart-service
    const cart = await fetchCart(resolvedCartSessionId);
    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    // ===== ÉTAPE 4 : Créer la commande via order-service =====
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

    // ===== ÉTAPE 5 : Envoyer l'email via email-service (non-bloquant) =====
    // L'échec de l'email ne doit pas empêcher la finalisation du paiement
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

    // ===== SUCCÈS : Retourner l'ID de la commande =====
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
