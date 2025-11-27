/**
 * DTOs pour le service paiement
 * Types partagés pour l'API REST
 */

// ===== TYPES BASÉS SUR PaymentCustomer =====

/**
 * Informations du client pour le paiement
 */
export interface PaymentCustomer {
  email: string;
  name?: string;
  phone?: string;
}

// ===== TYPES BASÉS SUR PaymentItem =====

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

// ===== TYPES BASÉS SUR PaymentCreateDTO =====

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

// ===== TYPES BASÉS SUR PaymentPublicDTO =====

/**
 * DTO public pour les réponses API
 */
export interface PaymentPublicDTO {
  id: string;
  status:
    | "pending"
    | "succeeded"
    | "failed"
    | "canceled"
    | "requires_payment_method"
    | "unpaid";
  amount: number;
  currency: string;
  customerEmail: string;
  createdAt: Date;
  clientSecret?: string;
  url?: string; // URL de redirection vers Stripe Checkout
  error?: string;
  message?: string;
}
