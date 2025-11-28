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

  /**
   * Créer un paiement
   * @param {Object} paymentData Données de paiement
   * @returns {Promise<Object>} Résultat du paiement
   */
  async createPayment(paymentData: any): Promise<any> {
    try {
      // Créer les éléments de ligne pour Stripe Checkout
      const line_items = paymentData.items.map((item: any) => {
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

      // Créer une session Stripe Checkout
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items,
        mode: "payment",
        customer_email: paymentData.customer.email,
        success_url:
          paymentData.successUrl || "http://localhost:3000/checkout/success",
        cancel_url:
          paymentData.cancelUrl || "http://localhost:3000/checkout/cancel",
        metadata: {
          customer_name: paymentData.customer.name || "",
          customer_phone: paymentData.customer.phone || "",
          ...paymentData.metadata,
        },
      });

      return {
        id: session.id,
        url: session.url, // URL de redirection vers Stripe Checkout
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
   * Transforme le panier en items de paiement et crée la session Stripe
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

      // Créer les éléments de ligne pour Stripe Checkout
      const line_items = paymentItems.map((item: any) => {
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

      // Créer une session Stripe Checkout
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items,
        mode: "payment",
        customer_email: customerEmail,
        success_url: data.successUrl,
        cancel_url: data.cancelUrl,
        metadata: {
          customer_name: customerName || "",
          customer_phone: customerPhone || "",
          ...data.metadata,
        },
      });

      return {
        id: session.id,
        url: session.url, // URL de redirection vers Stripe Checkout
        status: session.payment_status,
        amount: session.amount_total,
        currency: "eur",
        customerEmail: customerEmail,
        createdAt: new Date(session.created * 1000),
      };
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
   * Vérifier la configuration Stripe
   * @returns {Object} État de la configuration
   */
  getConfigurationStatus(): any {
    return {
      stripeConfigured: !!this.stripe,
      publicKey: process.env.STRIPE_PUBLIC_KEY
        ? "configured"
        : "not configured",
      secretKey: process.env.STRIPE_SECRET_KEY
        ? "configured"
        : "not configured",
    };
  }
}
console.log("STRIPE_SECRET_KEY:", process.env.STRIPE_SECRET_KEY);
