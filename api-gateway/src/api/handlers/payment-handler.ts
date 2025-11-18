import axios from "axios";
import { Request, Response } from "express";
import { SERVICES } from "../../config";

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
 * 3. Récupération données préparées → cart-service prépare les données pour order-service
 * 4. Résolution customerId → résolution depuis l'email via customer-service
 * 5. Création commande → appel order-service
 * 6. Envoi email → appel email-service (non-bloquant)
 */

// ============================================================================
// SECTION 1 : CART SERVICE
// ============================================================================

/**
 * Service pour les opérations sur le panier
 * Utilise les nouvelles routes optimisées de cart-service
 */
class CartService {
  /**
   * Récupère les données préparées pour order-service depuis cart-service
   *
   * Utilise la nouvelle route qui encapsule :
   * - Récupération du cart et snapshot
   * - Extraction des items avec calculs HT/TTC
   * - Extraction des adresses et informations customer
   *
   * @param cartSessionId - Identifiant de session du panier
   * @returns Données formatées pour order-service ou null si introuvable
   */
  static async prepareOrderData(cartSessionId: string): Promise<any | null> {
    try {
      const response = await axios.post(
        `${SERVICES.cart}/api/cart/prepare-order-data/${cartSessionId}`
      );
      return response.data?.data || null;
    } catch (error: any) {
      if (error?.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Récupère le cart et snapshot ensemble (pour l'email)
   *
   * @param cartSessionId - Identifiant de session du panier
   * @returns Cart et snapshot ou null si introuvable
   */
  static async getCheckoutData(cartSessionId: string): Promise<{
    cart: any;
    snapshot: any;
  } | null> {
    try {
      const response = await axios.get(
        `${SERVICES.cart}/api/cart/checkout-data/${cartSessionId}`
      );
      return {
        cart: response.data?.cart,
        snapshot: response.data?.snapshot,
      };
    } catch (error: any) {
      if (error?.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }
}

// ============================================================================
// SECTION 2 : CUSTOMER SERVICE
// ============================================================================

/**
 * Service pour la résolution du customerId
 */
class CustomerService {
  /**
   * Résout le customerId depuis l'email via customer-service
   *
   * @param email - Email du client
   * @returns customerId résolu ou undefined si impossible
   */
  static async resolveCustomerId(email: string): Promise<number | undefined> {
    if (!email) return undefined;

    try {
      const response = await axios.get(
        `${SERVICES.customer}/api/customers/by-email/${encodeURIComponent(
          email
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
 * Service pour la création de commandes
 */
class OrderService {
  /**
   * Prépare le payload final pour order-service
   *
   * Ajoute les informations manquantes aux données préparées par cart-service :
   * - customerId (résolu depuis l'email)
   * - customerSnapshot (fallback si customerId absent)
   * - paymentIntentId (pour idempotence)
   *
   * @param preparedData - Données préparées par cart-service
   * @param paymentIntentId - ID du payment intent Stripe (pour idempotence)
   * @returns Payload complet pour order-service
   */
  static async preparePayload(
    preparedData: any,
    paymentIntentId?: string
  ): Promise<any> {
    // Résoudre customerId depuis l'email
    const customerId = await CustomerService.resolveCustomerId(
      preparedData.customerEmail
    );

    // Construire les adresses au format attendu par order-service
    const addresses = [];
    if (preparedData.shippingAddress) {
      addresses.push({
        addressType: "shipping",
        addressSnapshot: preparedData.shippingAddress,
      });
    }
    if (preparedData.billingAddress) {
      addresses.push({
        addressType: "billing",
        addressSnapshot: preparedData.billingAddress,
      });
    }

    // Construire le payload pour order-service
    const payload: any = {
      totalAmountHT: preparedData.totalAmountHT,
      totalAmountTTC: preparedData.totalAmountTTC,
      paymentMethod: "stripe",
      notes: preparedData.notes,
      items: preparedData.items,
      addresses: addresses.length > 0 ? addresses : undefined,
    };

    // Ajouter customerId si disponible (priorité)
    if (customerId) {
      payload.customerId = customerId;
    }

    // Ajouter customerSnapshot (fallback si customerId absent)
    if (preparedData.customer) {
      payload.customerSnapshot = preparedData.customer;
    }

    // Ajouter paymentIntentId pour l'idempotence
    if (paymentIntentId) {
      payload.paymentIntentId = paymentIntentId;
    }

    return payload;
  }

  /**
   * Crée la commande via order-service
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
 */
class EmailService {
  /**
   * Prépare le payload pour email-service à partir du cart et snapshot
   *
   * @param orderId - ID de la commande créée
   * @param cart - Panier avec items et totaux
   * @param snapshot - Snapshot avec customer et adresses
   * @returns Payload formaté pour email-service
   */
  static preparePayload(orderId: number, cart: any, snapshot: any): any {
    const customer = snapshot.customer || {};
    const email = customer.email || snapshot.email || "";
    const shipping = snapshot.shippingAddress || snapshot.shipping_address;

    // Utiliser les items du cart (déjà avec tous les calculs HT/TTC)
    const cartItems = cart.items || [];
    const items = cartItems.map((item: any) => ({
      name: item.productName || `Produit #${item.productId}`,
      quantity: item.quantity,
      unitPrice: item.unitPriceTTC,
      totalPrice: item.totalPriceTTC,
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
      tax: Number(cart.tax ?? Math.max(cart.total - cart.subtotal, 0)),
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
   * Envoie l'email de confirmation via email-service (non-bloquant)
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
 * 3. Récupère les données préparées depuis cart-service (cart + snapshot formatés)
 * 4. Résout le customerId et construit le payload final pour order-service
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

    // ===== ÉTAPE 3 : Récupérer les données préparées depuis cart-service =====
    // Utilise la nouvelle route qui encapsule cart + snapshot + transformation
    console.log(
      `[handleFinalizePayment] Fetching prepared order data from cart-service...`
    );
    const preparedData = await CartService.prepareOrderData(
      resolvedCartSessionId
    );

    if (!preparedData) {
      return res.status(404).json({
        error: "Checkout data not found",
        message: "Cart or snapshot not found for this session",
      });
    }

    // ===== ÉTAPE 4 : Créer la commande via order-service =====
    console.log(`[handleFinalizePayment] Creating order...`);
    const orderPayload = await OrderService.preparePayload(
      preparedData,
      stripeSessionInfo.paymentIntentId
    );
    const orderId = await OrderService.create(orderPayload);
    console.log(
      `[handleFinalizePayment] Order created successfully: ${orderId}`
    );

    // ===== ÉTAPE 5 : Envoyer l'email via email-service (non-bloquant) =====
    // L'échec de l'email ne doit pas empêcher la finalisation du paiement
    try {
      // Récupérer cart + snapshot pour l'email (format différent)
      const checkoutData = await CartService.getCheckoutData(
        resolvedCartSessionId
      );
      if (checkoutData) {
        const emailPayload = EmailService.preparePayload(
          orderId,
          checkoutData.cart,
          checkoutData.snapshot
        );
        await EmailService.sendConfirmation(emailPayload);
        console.log(`[handleFinalizePayment] Email sent successfully`);
      }
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
