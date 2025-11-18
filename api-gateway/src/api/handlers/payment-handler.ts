import axios from "axios";
import { Request, Response } from "express";
import { SERVICES } from "../../config";
import { checkoutSnapshots } from "../controller/CartController";

/**
 * ============================================================================
 * PAYMENT HANDLER - Finalisation de paiement après succès Stripe
 * ============================================================================
 *
 * Rôle : Orchestration de la finalisation du paiement
 * - Utilise des services spécialisés pour chaque domaine
 * - Coordonne les appels aux services
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
// SECTION 1 : CART SERVICE
// ============================================================================

/**
 * Service pour les opérations sur le panier
 * Wrapper simple pour les appels au cart-service
 */
class CartService {
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
  static async fetchCart(cartSessionId: string): Promise<any> {
    const response = await axios.get(`${SERVICES.cart}/api/cart`, {
      params: { sessionId: cartSessionId },
    });
    const cart = response.data?.cart;

    return cart;
  }
}

// ============================================================================
// SECTION 2 : SNAPSHOT SERVICE
// ============================================================================

/**
 * Service pour l'extraction des données du snapshot checkout
 * Gère l'extraction de customer, adresses et résolution du customerId
 */
class SnapshotService {
  /**
   * Extrait les informations customer depuis le snapshot checkout
   *
   * @param snapshot - Snapshot checkout (customer, adresses, notes)
   * @returns Informations customer et email extraites
   */
  static extractCustomerInfo(snapshot: any): {
    customer: any;
    email: string;
  } {
    const customer = snapshot.customer || {};
    const email = customer.email || snapshot.email || "";
    return { customer, email };
  }

  /**
   * Extrait les adresses de livraison et facturation depuis le snapshot
   *
   * Gère les différents formats possibles (camelCase vs snake_case).
   *
   * @param snapshot - Snapshot checkout
   * @returns Adresses de livraison et facturation (billing peut être null)
   */
  static extractAddresses(snapshot: any): {
    shippingAddress: any;
    billingAddress: any;
  } {
    const shippingAddress =
      snapshot.shippingAddress || snapshot.shipping_address;
    const billingAddress = snapshot.billingAddress || snapshot.billing_address;
    return { shippingAddress, billingAddress };
  }

  /**
   * Résout le customerId depuis l'email via customer-service
   *
   * Le customerId est nécessaire pour lier la commande au client dans la base.
   * La résolution se fait en recherchant un client existant avec l'email fourni
   * dans le snapshot checkout.
   *
   * @param snapshot - Snapshot checkout contenant l'email du client
   * @returns customerId résolu ou undefined si impossible
   */
  static async resolveCustomerId(snapshot: any): Promise<number | undefined> {
    // Résoudre depuis l'email via customer-service (route optimisée)
    const customerEmail = snapshot.customer?.email || snapshot.email;
    if (!customerEmail) return undefined;

    try {
      const response = await axios.get(
        `${SERVICES.customer}/api/customers/by-email/${encodeURIComponent(
          customerEmail
        )}/id`
      );
      return response.data?.customerId;
    } catch (error) {
      return undefined;
    }
  }
}

// ============================================================================
// SECTION 3 : ORDER SERVICE
// ============================================================================

/**
 * Service pour la préparation et création de commandes
 * Gère la transformation des données et l'appel à order-service
 */
class OrderService {
  /**
   * Prépare le payload pour order-service à partir du cart et snapshot
   *
   * Combine les données du panier (items, totaux) et du snapshot (customer, adresses)
   * pour créer un payload complet pour order-service.
   *
   * Structure du payload :
   * - Totaux (HT/TTC) depuis le cart
   * - Items du cart (déjà au bon format avec calculs HT/TTC)
   * - Adresses depuis le snapshot
   * - customerId résolu depuis l'email
   * - customerSnapshot (fallback si customerId absent)
   * - paymentIntentId (pour idempotence)
   *
   * Note : Les items du cart sont déjà au format attendu par order-service
   * (unitPriceHT, unitPriceTTC, totalPriceHT, totalPriceTTC) grâce au cart-service.
   * On utilise directement ces items sans transformation.
   *
   * @param cart - Panier complet avec items et totaux
   * @param snapshot - Snapshot checkout avec customer et adresses
   * @param paymentIntentId - ID du payment intent Stripe (pour idempotence)
   * @returns Payload formaté pour order-service
   */
  static async preparePayload(
    cart: any,
    snapshot: any,
    paymentIntentId?: string
  ): Promise<any> {
    const cartItems = cart.items || [];

    // Les items du cart sont déjà au bon format (unitPriceHT, unitPriceTTC, etc.)
    // On s'assure juste que productName existe (fallback si absent)
    const items = cartItems.map((item: any) => ({
      productId: item.productId,
      productName: item.productName || `Produit #${item.productId}`,
      quantity: item.quantity,
      unitPriceHT: item.unitPriceHT,
      unitPriceTTC: item.unitPriceTTC,
      vatRate: item.vatRate,
      totalPriceHT: item.totalPriceHT,
      totalPriceTTC: item.totalPriceTTC,
    }));

    // Résoudre customerId depuis l'email
    const customerId = await SnapshotService.resolveCustomerId(snapshot);

    // Extraire les adresses depuis le snapshot
    const { shippingAddress, billingAddress } =
      SnapshotService.extractAddresses(snapshot);
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
  static async create(payload: any): Promise<number> {
    const response = await axios.post(
      `${SERVICES.order}/api/orders/from-checkout`,
      payload,
      { headers: { "Content-Type": "application/json" } }
    );
    return response.data?.order?.id;
  }
}

// ============================================================================
// SECTION 4 : EMAIL SERVICE
// ============================================================================

/**
 * Service pour la préparation et l'envoi d'emails
 * Gère le formatage des données et l'appel à email-service
 */
class EmailService {
  /**
   * Prépare le payload pour email-service à partir du cart et snapshot
   *
   * Format les données pour l'email de confirmation de commande.
   * Utilise directement les données du cart (déjà avec tous les calculs HT/TTC).
   *
   * @param orderId - ID de la commande créée
   * @param cart - Panier avec items et totaux
   * @param snapshot - Snapshot avec customer et adresses
   * @returns Payload formaté pour email-service
   */
  static preparePayload(orderId: number, cart: any, snapshot: any): any {
    // Extraire les informations customer et adresses
    const { customer, email } = SnapshotService.extractCustomerInfo(snapshot);
    const { shippingAddress: shipping } =
      SnapshotService.extractAddresses(snapshot);

    // Utiliser directement les items du cart (déjà avec tous les calculs)
    // Le cart-service retourne maintenant unitPriceHT, unitPriceTTC, totalPriceHT, totalPriceTTC
    const cartItems = cart.items || [];
    const items = cartItems.map((item: any) => ({
      name: item.productName || `Produit #${item.productId}`,
      quantity: item.quantity,
      unitPrice: item.unitPriceTTC, // Prix unitaire TTC pour l'email
      totalPrice: item.totalPriceTTC, // Total TTC pour l'email
      vatRate: item.vatRate,
    }));

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
  static async sendConfirmation(payload: any): Promise<void> {
    await axios.post(
      `${SERVICES.email}/api/email/order-confirmation`,
      payload,
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

// ============================================================================
// SECTION 5 : HANDLER PRINCIPAL - ORCHESTRATION
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
 * - Si récupération Stripe via payment-service échoue → continue sans paymentIntentId (perte d'idempotence)
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

    // ===== ÉTAPE 1 : Récupérer la session Stripe via payment-service =====
    // Nécessaire pour paymentIntentId (idempotence) et métadonnées (customerId)
    let stripeSessionInfo: {
      session: any;
      paymentIntentId: string | undefined;
    };
    try {
      const response = await axios.get(
        `${SERVICES.payment}/api/payment/session/${csid}`
      );
      stripeSessionInfo = {
        session: response.data.session,
        paymentIntentId: response.data.paymentIntentId,
      };
    } catch (e: any) {
      console.warn(
        "[handleFinalizePayment] Unable to fetch Stripe session from payment-service:",
        e?.message
      );
      // Continue sans paymentIntentId si nécessaire (perte d'idempotence mais processus continue)
      stripeSessionInfo = { session: null, paymentIntentId: undefined };
    }

    // ===== ÉTAPE 2 : Résoudre le cartSessionId =====
    // Identifie le panier et le snapshot à utiliser
    // Priorité : cartSessionId fourni > Map en mémoire
    let resolvedCartSessionId = cartSessionId;
    if (!resolvedCartSessionId && stripeSessionToCartSession) {
      resolvedCartSessionId = stripeSessionToCartSession.get(csid) || undefined;
    }

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
    const cart = await CartService.fetchCart(resolvedCartSessionId);
    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    // ===== ÉTAPE 4 : Créer la commande via order-service =====
    console.log(`[handleFinalizePayment] Creating order...`);
    const orderPayload = await OrderService.preparePayload(
      cart,
      snapshot,
      stripeSessionInfo.paymentIntentId
    );
    const orderId = await OrderService.create(orderPayload);
    console.log(
      `[handleFinalizePayment] Order created successfully: ${orderId}`
    );

    // ===== ÉTAPE 5 : Envoyer l'email via email-service (non-bloquant) =====
    // L'échec de l'email ne doit pas empêcher la finalisation du paiement
    try {
      const emailPayload = EmailService.preparePayload(orderId, cart, snapshot);
      await EmailService.sendConfirmation(emailPayload);
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
