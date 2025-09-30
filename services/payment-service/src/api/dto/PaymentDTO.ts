/**
 * Payment DTOs - Version simplifiée pour Stripe
 * Data transfer objects pour la gestion des paiements
 */

/**
 * Informations du client pour le paiement
 */
export interface PaymentCustomer {
  email: string;
  name?: string;
  phone?: string;
}

/**
 * Article à payer
 */
export interface PaymentItem {
  name: string;
  description?: string;
  price: number; // en centimes
  quantity: number;
  currency: string;
}

/**
 * DTO pour créer un paiement
 */
export interface PaymentCreateDTO {
  customer: PaymentCustomer;
  items: PaymentItem[];
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}

/**
 * DTO pour confirmer un paiement
 */
export interface PaymentConfirmDTO {
  paymentIntentId: string;
}

/**
 * DTO pour rembourser un paiement
 */
export interface PaymentRefundDTO {
  paymentIntentId: string;
  amount?: number; // en centimes, si non spécifié = remboursement total
  reason?: string;
}

/**
 * DTO public pour les réponses API
 */
export interface PaymentPublicDTO {
  id: string;
  status: "pending" | "succeeded" | "failed" | "canceled" | "refunded";
  amount: number;
  currency: string;
  customerEmail: string;
  createdAt: Date;
  clientSecret?: string;
  error?: string;
}

/**
 * DTO pour les statistiques de paiement
 */
export interface PaymentStatsDTO {
  totalPayments: number;
  successfulPayments: number;
  failedPayments: number;
  totalAmount: number;
  currency: string;
  period: string;
}
