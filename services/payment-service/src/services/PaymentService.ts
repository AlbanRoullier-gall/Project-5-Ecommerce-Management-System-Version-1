/**
 * PaymentService - Version simplifiée pour Stripe
 * Business logic layer pour la gestion des paiements
 */

import Stripe from "stripe";

export default class PaymentService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(
      process.env.STRIPE_SECRET_KEY ||
        "sk_test_51RtjchLi6vN59MNetUhP86QSndKeI5GfJCMseKO8dSq4D93k0td4AZyJ5d4SiKTveQh9pThKaj9d9MyzpTEuoFdU00ZW6qtK90",
      {
        apiVersion: "2023-10-16",
      }
    );
    console.log("✅ Stripe service initialized");
  }

  // ===== MÉTHODES PRIVÉES =====

  /**
   * Construire les line_items Stripe à partir d'une liste d'items
   * @param {any[]} items Liste d'items avec name, description, price, quantity, currency
   * @returns {any[]} Line items formatés pour Stripe
   */
  private buildLineItems(items: any[]): any[] {
    return items.map((item: any) => {
      const product_data: any = { name: item.name };
      if (item.description && String(item.description).trim().length > 0) {
        product_data.description = item.description;
      }
      return {
        price_data: {
          currency: item.currency || "eur",
          product_data,
          unit_amount: item.price, // Prix en centimes
        },
        quantity: item.quantity,
      };
    });
  }

  /**
   * Créer une session Stripe Checkout
   * @param {any} params Paramètres de la session
   * @returns {Promise<Stripe.Checkout.Session>} Session Stripe créée
   */
  private async createStripeSession(params: {
    lineItems: any[];
    customerEmail: string;
    successUrl: string;
    cancelUrl: string;
    metadata?: Record<string, string>;
  }): Promise<Stripe.Checkout.Session> {
    return await this.stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: params.lineItems,
      mode: "payment",
      customer_email: params.customerEmail,
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      metadata: params.metadata || {},
    });
  }

  /**
   * Transformer un panier en données de paiement
   * @param {any} data Données du panier
   * @returns {any} Données de paiement formatées
   */
  private cartToPaymentData(data: {
    cart: any;
    customer?: { email: string; name?: string; phone?: string };
    customerData?: {
      firstName?: string;
      lastName?: string;
      email: string;
      phoneNumber?: string;
    };
    successUrl: string;
    cancelUrl: string;
    metadata?: Record<string, string>;
  }): any {
    // Valider que le panier n'est pas vide
    if (!data.cart || !data.cart.items || data.cart.items.length === 0) {
      throw new Error("Le panier est vide");
    }

    // Construire customer.name à partir de customerData si disponible
    let customerName = data.customer?.name;
    if (!customerName && data.customerData) {
      customerName = `${data.customerData.firstName || ""} ${
        data.customerData.lastName || ""
      }`.trim();
    }

    // Utiliser customer.email ou customerData.email
    const customerEmail = data.customer?.email || data.customerData?.email;
    if (!customerEmail) {
      throw new Error("L'email du client est requis");
    }

    // Utiliser customer.phone ou customerData.phoneNumber
    const customerPhone =
      data.customer?.phone || data.customerData?.phoneNumber;

    // Transformer les items du panier en items de paiement
    const paymentItems = data.cart.items.map((item: any) => ({
      name: item.productName,
      description: item.description || "",
      price: Math.round(item.unitPriceTTC * 100), // Conversion en centimes
      quantity: item.quantity,
      currency: "eur",
    }));

    return {
      items: paymentItems,
      customer: {
        email: customerEmail,
        name: customerName || "",
        phone: customerPhone || "",
      },
      successUrl: data.successUrl,
      cancelUrl: data.cancelUrl,
      currency: "eur",
      metadata: {
        customer_name: customerName || "",
        customer_phone: customerPhone || "",
        ...data.metadata,
      },
    };
  }

  // ===== MÉTHODES PUBLIQUES =====

  /**
   * Créer un paiement
   * @param {Object} paymentData Données de paiement
   * @returns {Promise<Object>} Résultat du paiement
   */
  async createPayment(paymentData: any): Promise<any> {
    try {
      const lineItems = this.buildLineItems(paymentData.items);

      const session = await this.createStripeSession({
        lineItems,
        customerEmail: paymentData.customer.email,
        successUrl:
          paymentData.successUrl || "http://localhost:3000/checkout/success",
        cancelUrl:
          paymentData.cancelUrl || "http://localhost:3000/checkout/cancel",
        metadata: {
          customer_name: paymentData.customer.name || "",
          customer_phone: paymentData.customer.phone || "",
          ...paymentData.metadata,
        },
      });

      return {
        id: session.id,
        url: session.url,
        status: session.payment_status,
        amount: session.amount_total,
        currency: paymentData.currency,
        customerEmail: paymentData.customer.email,
        createdAt: new Date(session.created * 1000),
      };
    } catch (error: any) {
      console.error("Error creating payment:", error);
      throw new Error(
        `Erreur lors de la création du paiement: ${error.message}`
      );
    }
  }

  /**
   * Créer un paiement depuis un panier
   * Transforme le panier en données de paiement et utilise createPayment
   * @param {Object} data Données contenant le panier et les informations de paiement
   * @returns {Promise<Object>} Résultat du paiement
   */
  async createPaymentFromCart(data: {
    cart: any; // CartPublicDTO
    customer: {
      email: string;
      name?: string;
      phone?: string;
    };
    customerData?: {
      firstName?: string;
      lastName?: string;
      email: string;
      phoneNumber?: string;
    };
    successUrl: string;
    cancelUrl: string;
    metadata?: Record<string, string>;
  }): Promise<any> {
    try {
      const paymentData = this.cartToPaymentData(data);
      return await this.createPayment(paymentData);
    } catch (error: any) {
      console.error("Error creating payment from cart:", error);
      throw new Error(
        `Erreur lors de la création du paiement: ${error.message}`
      );
    }
  }

  /**
   * Extrait le payment intent ID depuis une session Stripe
   *
   * Le paymentIntentId est utilisé pour l'idempotence : si une commande avec
   * le même paymentIntentId existe déjà, elle n'est pas dupliquée.
   *
   * @param session - Session Stripe récupérée via l'API
   * @returns Le payment intent ID (string) ou undefined si absent
   */
  private extractPaymentIntentId(
    session: Stripe.Checkout.Session
  ): string | undefined {
    // Stripe peut retourner payment_intent comme string ou comme objet
    if (typeof session.payment_intent === "string") {
      return session.payment_intent;
    }
    return (session.payment_intent as Stripe.PaymentIntent)?.id || undefined;
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
   * @throws Error si STRIPE_SECRET_KEY n'est pas configuré ou si la session n'existe pas
   */
  async getSessionInfo(csid: string): Promise<{
    session: Stripe.Checkout.Session;
    paymentIntentId: string | undefined;
  }> {
    try {
      const session = await this.stripe.checkout.sessions.retrieve(csid);
      const paymentIntentId = this.extractPaymentIntentId(session);

      return { session, paymentIntentId };
    } catch (error: any) {
      console.error("Error retrieving Stripe session:", error);
      if (error.type === "StripeInvalidRequestError") {
        throw new Error(`Session Stripe non trouvée: ${csid}`);
      }
      throw new Error(
        `Erreur lors de la récupération de la session Stripe: ${error.message}`
      );
    }
  }

  /**
   * Transforme les items d'un panier en format Stripe
   * Conversion des prix TTC en centimes pour Stripe
   *
   * @param cartItems - Items du panier (CartItemPublicDTO[])
   * @returns Items formatés pour Stripe avec prix en centimes
   */
  transformCartItemsToStripeItems(
    cartItems: Array<{
      productName: string;
      description?: string | null;
      unitPriceTTC: number;
      quantity: number;
    }>
  ): Array<{
    name: string;
    description: string;
    price: number; // en centimes
    quantity: number;
    currency: string;
  }> {
    return cartItems.map((item) => ({
      name: item.productName,
      description: item.description || "",
      price: Math.round(item.unitPriceTTC * 100), // Conversion en centimes
      quantity: item.quantity,
      currency: "eur",
    }));
  }

  /**
   * Extrait les métadonnées importantes d'une session Stripe
   *
   * @param session - Session Stripe
   * @returns Métadonnées extraites (customerId, paymentIntentId)
   */
  extractSessionMetadata(session: Stripe.Checkout.Session): {
    customerId?: number | undefined;
    paymentIntentId?: string | undefined;
    cartSessionId?: string | undefined;
  } {
    const metadata = session.metadata || {};
    const paymentIntentId = this.extractPaymentIntentId(session);

    let customerId: number | undefined = undefined;
    if (metadata.customerId) {
      const parsed = parseInt(metadata.customerId, 10);
      if (!isNaN(parsed)) {
        customerId = parsed;
      }
    }

    return {
      customerId,
      paymentIntentId,
      cartSessionId: metadata.cartSessionId,
    };
  }

  /**
   * Créer un paiement depuis un panier avec checkoutData
   * Version simplifiée qui accepte directement le panier avec checkoutData
   * et fait toute la transformation en interne
   *
   * @param data - Données contenant le panier avec checkoutData
   * @returns Résultat du paiement
   */
  async createPaymentFromCartWithCheckout(data: {
    cart: {
      items: Array<{
        productName: string;
        description?: string | null;
        unitPriceTTC: number;
        quantity: number;
      }>;
    };
    checkoutData: {
      customerData: {
        email: string;
        firstName?: string;
        lastName?: string;
        phoneNumber?: string;
      };
    };
    successUrl: string;
    cancelUrl: string;
    metadata?: Record<string, string>;
  }): Promise<any> {
    try {
      // Valider que le panier n'est pas vide
      if (!data.cart || !data.cart.items || data.cart.items.length === 0) {
        throw new Error("Le panier est vide");
      }

      // Valider que checkoutData est présent
      if (!data.checkoutData || !data.checkoutData.customerData?.email) {
        throw new Error("Les données checkout sont obligatoires");
      }

      // Transformer les items du panier en format Stripe
      const stripeItems = this.transformCartItemsToStripeItems(data.cart.items);

      // Construire le nom du client
      const customerName = data.checkoutData.customerData
        ? `${data.checkoutData.customerData.firstName || ""} ${
            data.checkoutData.customerData.lastName || ""
          }`.trim()
        : "";

      // Créer le payload de paiement
      const paymentData = {
        items: stripeItems,
        customer: {
          email: data.checkoutData.customerData.email,
          name: customerName,
          phone: data.checkoutData.customerData.phoneNumber || "",
        },
        successUrl: data.successUrl,
        cancelUrl: data.cancelUrl,
        metadata: data.metadata || {},
      };

      return await this.createPayment(paymentData);
    } catch (error: any) {
      console.error("Error creating payment from cart with checkout:", error);
      throw new Error(
        `Erreur lors de la création du paiement: ${error.message}`
      );
    }
  }
}
console.log("STRIPE_SECRET_KEY:", process.env.STRIPE_SECRET_KEY);
