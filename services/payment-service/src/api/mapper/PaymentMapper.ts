/**
 * Mapper de Paiement - Version simplifiée pour Stripe
 * Mapper pour les conversions DTO ↔ Service
 */

import { PaymentCreateDTO, PaymentConfirmDTO, PaymentPublicDTO } from "../dto";

/**
 * Classe Mapper de Paiement
 */
export class PaymentMapper {
  /**
   * Convertir PaymentCreateDTO en données d'intention de paiement Stripe
   */
  static paymentCreateDTOToStripeData(dto: PaymentCreateDTO): any {
    const totalAmount = dto.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    return {
      amount: totalAmount,
      currency: dto.items[0]?.currency || "eur",
      customer: {
        email: dto.customer.email,
        name: dto.customer.name,
        phone: dto.customer.phone,
      },
      items: dto.items,
      successUrl: dto.successUrl,
      cancelUrl: dto.cancelUrl,
      metadata: dto.metadata || {},
    };
  }

  /**
   * Convertir PaymentConfirmDTO en données de confirmation Stripe
   */
  static paymentConfirmDTOToStripeData(dto: PaymentConfirmDTO): any {
    return {
      paymentIntentId: dto.paymentIntentId,
    };
  }

  /**
   * Convertir l'intention de paiement Stripe ou la session de checkout en PaymentPublicDTO
   */
  static stripePaymentIntentToPublicDTO(paymentIntent: any): PaymentPublicDTO {
    return {
      id: paymentIntent.id,
      status: paymentIntent.status || paymentIntent.payment_status || "pending",
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      customerEmail:
        paymentIntent.receipt_email ||
        paymentIntent.customerEmail ||
        paymentIntent.customer?.email ||
        "",
      createdAt:
        paymentIntent.createdAt ||
        (paymentIntent.created
          ? new Date(paymentIntent.created * 1000)
          : new Date()),
      clientSecret: paymentIntent.client_secret,
      url: paymentIntent.url, // URL pour Stripe Checkout
      error: paymentIntent.last_payment_error?.message,
    };
  }
}
