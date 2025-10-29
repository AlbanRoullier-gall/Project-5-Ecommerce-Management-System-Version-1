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

/**
 * DTO pour la création d'un client
 */
export interface PaymentCustomerCreateDTO {
  email: string;
  name?: string;
  phone?: string;
}

/**
 * DTO pour la mise à jour d'un client
 */
export interface PaymentCustomerUpdateDTO {
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

/**
 * DTO pour la création d'un article
 */
export interface PaymentItemCreateDTO {
  name: string;
  description?: string;
  price: number;
  quantity: number;
  currency: string;
}

/**
 * DTO pour la mise à jour d'un article
 */
export interface PaymentItemUpdateDTO {
  name?: string;
  description?: string;
  price?: number;
  quantity?: number;
  currency?: string;
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

/**
 * DTO pour la mise à jour d'un paiement
 */
export interface PaymentUpdateDTO {
  customer?: PaymentCustomer;
  items?: PaymentItem[];
  successUrl?: string;
  cancelUrl?: string;
  metadata?: Record<string, string>;
}

// ===== TYPES BASÉS SUR PaymentConfirmDTO =====

/**
 * DTO pour confirmer un paiement
 */
export interface PaymentConfirmDTO {
  paymentIntentId: string;
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

// ===== TYPES SPÉCIFIQUES =====

/**
 * DTO pour les options de recherche de paiements
 */
export interface PaymentSearchDTO {
  page?: number;
  limit?: number;
  status?: string;
  customerEmail?: string;
  dateFrom?: string;
  dateTo?: string;
}

/**
 * DTO pour les webhooks Stripe
 */
export interface PaymentWebhookDTO {
  type: string;
  data: {
    object: any;
  };
}

/**
 * DTO pour les méthodes de paiement
 */
export interface PaymentMethodDTO {
  id: string;
  type: string;
  card?: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  };
  isDefault: boolean;
}

/**
 * DTO pour créer une méthode de paiement
 */
export interface PaymentMethodCreateDTO {
  customerId: string;
  paymentMethodId: string;
  isDefault?: boolean;
}

/**
 * DTO pour les sessions de paiement
 */
export interface PaymentSessionDTO {
  id: string;
  url: string;
  expiresAt: Date;
  status: "open" | "complete" | "expired";
}
