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

// ===== TYPES SPÉCIFIQUES =====

/**
 * DTO pour créer un paiement depuis un panier
 */
export interface PaymentFromCartDTO {
  cart: {
    id: string;
    sessionId: string;
    items: Array<{
      id: string;
      productId: number;
      productName: string;
      description?: string;
      imageUrl?: string;
      quantity: number;
      unitPriceHT: number;
      unitPriceTTC: number;
      vatRate: number;
      totalPriceHT: number;
      totalPriceTTC: number;
    }>;
    subtotal: number;
    tax: number;
    total: number;
  };
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
}
