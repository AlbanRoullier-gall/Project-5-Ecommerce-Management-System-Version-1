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
 * DTO pour créer une commande complète avec items et adresses
 * Inclut la commande, les items et les adresses en une seule transaction
 */
export interface OrderCompleteDTO {
  // Données de la commande
  customerId?: number; // Optionnel, peut être résolu depuis customerSnapshot
  customerSnapshot?: any;
  totalAmountHT: number;
  totalAmountTTC: number;
  paymentMethod: string;
  paymentIntentId?: string;
  notes?: string;
  // Items de la commande (avec toutes les infos nécessaires)
  items: Array<{
    productId: number;
    productName: string;
    quantity: number;
    unitPriceHT: number;
    unitPriceTTC: number;
    vatRate: number;
    totalPriceHT: number;
    totalPriceTTC: number;
  }>;
  // Adresses (optionnelles)
  addresses?: Array<{
    addressType: "shipping" | "billing";
    addressSnapshot: any;
  }>;
}
