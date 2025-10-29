/**
 * PaymentService - Version simplifiée pour Stripe
 * Business logic layer pour la gestion des paiements
 */

import Stripe from "stripe";

export default class PaymentService {
  private stripe: Stripe;
  private webhookSecret: string;

  constructor() {
    this.stripe = new Stripe(
      process.env.STRIPE_SECRET_KEY ||
        "sk_test_51RtjchLi6vN59MNetUhP86QSndKeI5GfJCMseKO8dSq4D93k0td4AZyJ5d4SiKTveQh9pThKaj9d9MyzpTEuoFdU00ZW6qtK90",
      {
        apiVersion: "2023-08-16",
      }
    );
    this.webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";
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
   * Confirmer un paiement
   * @param {string} paymentIntentId Identifiant de l'intention de paiement
   * @returns {Promise<Object>} Résultat du paiement
   */
  async confirmPayment(paymentIntentId: string): Promise<any> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(
        paymentIntentId
      );

      if (paymentIntent.status === "succeeded") {
        return {
          id: paymentIntent.id,
          status: paymentIntent.status,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          customerEmail: paymentIntent.receipt_email || "",
          createdAt: new Date(paymentIntent.created * 1000),
        };
      }

      // Si le paiement nécessite une méthode de paiement, on retourne les informations nécessaires
      if (paymentIntent.status === "requires_payment_method") {
        return {
          id: paymentIntent.id,
          status: paymentIntent.status,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          customerEmail: paymentIntent.receipt_email || "",
          createdAt: new Date(paymentIntent.created * 1000),
          clientSecret: paymentIntent.client_secret,
          message:
            "Paiement créé avec succès. Utilisez le client_secret pour compléter le paiement côté frontend.",
        };
      }

      const confirmedPayment = await this.stripe.paymentIntents.confirm(
        paymentIntentId,
        {
          payment_method: "pm_card_visa", // Méthode de test Stripe
        }
      );

      return {
        id: confirmedPayment.id,
        status: confirmedPayment.status,
        amount: confirmedPayment.amount,
        currency: confirmedPayment.currency,
        customerEmail: confirmedPayment.receipt_email || "",
        createdAt: new Date(confirmedPayment.created * 1000),
      };
    } catch (error: any) {
      console.error("Error confirming payment:", error);
      throw new Error(
        `Erreur lors de la confirmation du paiement: ${error.message}`
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
      webhookConfigured: !!this.webhookSecret,
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
