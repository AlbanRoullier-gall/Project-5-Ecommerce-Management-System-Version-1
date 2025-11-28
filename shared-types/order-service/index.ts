/**
 * DTOs pour le service commande
 * Types partagés pour l'API REST
 */

// ===== TYPES BASÉS SUR OrderData =====

/**
 * DTO public pour une commande
 * Basé sur OrderData avec informations client
 */
export interface OrderPublicDTO {
  id: number;
  customerId: number;
  customerSnapshot: any | null;
  totalAmountHT: number;
  totalAmountTTC: number;
  paymentMethod: string | null;
  notes: string | null;
  delivered: boolean;
  customerFirstName?: string;
  customerLastName?: string;
  customerEmail?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ===== TYPES BASÉS SUR OrderItemData =====

/**
 * DTO public pour un article de commande
 */
export interface OrderItemPublicDTO {
  id: number;
  orderId: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPriceHT: number;
  unitPriceTTC: number;
  vatRate: number;
  totalPriceHT: number;
  totalPriceTTC: number;
  createdAt: Date;
  updatedAt: Date;
}

// ===== TYPES BASÉS SUR OrderAddressData =====

/**
 * DTO public pour une adresse de commande
 */
export interface OrderAddressPublicDTO {
  id: number;
  orderId: number;
  addressType: "shipping" | "billing";
  addressSnapshot: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    phone?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// ===== TYPES BASÉS SUR CreditNoteData =====

/**
 * DTO pour la création d'un avoir
 */
export interface CreditNoteCreateDTO {
  customerId: number;
  orderId: number;
  reason: string;
  description?: string;
  issueDate?: string; // ISO date string
  paymentMethod?: string;
  totalAmountHT: number;
  totalAmountTTC: number;
  notes?: string;
}

/**
 * DTO public pour un avoir
 */
export interface CreditNotePublicDTO {
  id: number;
  customerId: number;
  orderId: number;
  reason: string;
  description: string | null;
  issueDate: Date | null;
  paymentMethod: string | null;
  totalAmountHT: number;
  totalAmountTTC: number;
  notes: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

// ===== TYPES BASÉS SUR CreditNoteItemData =====

/**
 * DTO pour la création d'un article d'avoir
 */
export interface CreditNoteItemCreateDTO {
  creditNoteId: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPriceHT: number;
  unitPriceTTC: number;
  vatRate: number;
  totalPriceHT: number;
  totalPriceTTC: number;
}

/**
 * DTO public pour un article d'avoir
 */
export interface CreditNoteItemPublicDTO {
  id: number;
  creditNoteId: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPriceHT: number;
  unitPriceTTC: number;
  totalPriceHT: number;
  totalPriceTTC: number;
  createdAt: Date;
  updatedAt: Date;
}

// ===== TYPES SPÉCIFIQUES =====

/**
 * DTO pour créer une commande depuis un panier
 */
export interface OrderFromCartDTO {
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
  customerId?: number;
  customerSnapshot?: any;
  customerData: {
    email: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
  };
  addressData: {
    shipping: {
      address?: string;
      postalCode?: string;
      city?: string;
      countryName?: string;
    };
    billing?: {
      address?: string;
      postalCode?: string;
      city?: string;
      countryName?: string;
    };
    useSameBillingAddress: boolean;
  };
  paymentMethod: string;
  paymentIntentId?: string;
}

/**
 * DTO pour les options de recherche de commandes
 */
export interface OrderListRequestDTO {
  page?: number;
  limit?: number;
  search?: string;
  customerId?: number;
  year?: number;
  total?: number;
  date?: string;
}

/**
 * DTO pour mettre à jour le statut de livraison d'une commande
 */
export interface OrderUpdateDeliveryStatusDTO {
  delivered: boolean;
}

/**
 * DTO pour mettre à jour le statut d'un avoir
 */
export interface OrderUpdateCreditNoteStatusDTO {
  status: "pending" | "refunded";
}

/**
 * DTO pour les options de recherche d'avoirs
 */
export interface CreditNoteListRequestDTO {
  page?: number;
  limit?: number;
  customerId?: number;
  year?: number;
  startDate?: string;
  endDate?: string;
}

/**
 * DTO pour les options de recherche de statistiques de commandes
 */
export interface OrderStatisticsRequestDTO {
  startDate?: string;
  endDate?: string;
  customerId?: number;
  status?: string;
  year?: number;
}
