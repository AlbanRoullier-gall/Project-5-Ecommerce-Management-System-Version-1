/**
 * Payment Mapper - Version simplifiée pour Stripe
 * Mapper pour les conversions DTO ↔ Service
 */

import {
  PaymentCreateDTO,
  PaymentConfirmDTO,
  PaymentRefundDTO,
  PaymentPublicDTO,
} from "../dto";

/**
 * Payment Mapper class
 */
export class PaymentMapper {
  /**
   * Convert PaymentCreateDTO to Stripe payment intent data
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
   * Convert PaymentConfirmDTO to Stripe confirmation data
   */
  static paymentConfirmDTOToStripeData(dto: PaymentConfirmDTO): any {
    return {
      paymentIntentId: dto.paymentIntentId,
    };
  }

  /**
   * Convert PaymentRefundDTO to Stripe refund data
   */
  static paymentRefundDTOToStripeData(dto: PaymentRefundDTO): any {
    return {
      paymentIntentId: dto.paymentIntentId,
      amount: dto.amount,
      reason: dto.reason || "requested_by_customer",
    };
  }

  /**
   * Convert Stripe PaymentIntent or Checkout Session to PaymentPublicDTO
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

  /**
   * Convert Stripe refund to PaymentPublicDTO
   */
  static stripeRefundToPublicDTO(
    refund: any,
    originalPayment: any
  ): PaymentPublicDTO {
    return {
      id: refund.id,
      status: "refunded",
      amount: refund.amount,
      currency: refund.currency,
      customerEmail:
        originalPayment.receipt_email || originalPayment.customer?.email || "",
      createdAt: new Date(refund.created * 1000),
      error: refund.failure_reason,
    };
  }
}
