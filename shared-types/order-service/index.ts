/**
 * DTOs pour le service commande
 * Types partagés pour l'API REST
 */

// ===== TYPES BASÉS SUR OrderData =====

/**
 * DTO pour la création d'une commande
 * Basé sur OrderData avec conversion camelCase
 */
export interface OrderCreateDTO {
  customerId: number;
  customerSnapshot: any;
  totalAmountHT: number;
  totalAmountTTC: number;
  paymentMethod: string | null;
  notes?: string;
}

/**
 * DTO pour la mise à jour d'une commande
 * Utilise Partial pour rendre tous les champs optionnels
 */
export interface OrderUpdateDTO {
  customerSnapshot?: any;
  totalAmountHT?: number;
  totalAmountTTC?: number;
  paymentMethod?: string | null;
  notes?: string;
}

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
 * DTO pour la création d'un article de commande
 */
export interface OrderItemCreateDTO {
  orderId: number;
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
 * DTO pour la mise à jour d'un article de commande
 */
export interface OrderItemUpdateDTO {
  productName?: string;
  quantity?: number;
  unitPriceHT?: number;
  unitPriceTTC?: number;
  totalPriceHT?: number;
  totalPriceTTC?: number;
}

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
 * DTO pour la création d'une adresse de commande
 */
export interface OrderAddressCreateDTO {
  orderId: number;
  addressType: "shipping" | "billing";
  firstName: string;
  lastName: string;
  company?: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  phone?: string;
}

/**
 * DTO pour la mise à jour d'une adresse de commande
 */
export interface OrderAddressUpdateDTO {
  firstName?: string;
  lastName?: string;
  company?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
}

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
    company?: string;
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
 * DTO pour la mise à jour d'un avoir
 */
export interface CreditNoteUpdateDTO {
  reason?: string;
  description?: string;
  issueDate?: string; // ISO date string
  paymentMethod?: string;
  totalAmountHT?: number;
  totalAmountTTC?: number;
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
  totalPriceHT: number;
  totalPriceTTC: number;
}

/**
 * DTO pour la mise à jour d'un article d'avoir
 */
export interface CreditNoteItemUpdateDTO {
  productName?: string;
  quantity?: number;
  unitPriceHT?: number;
  unitPriceTTC?: number;
  totalPriceHT?: number;
  totalPriceTTC?: number;
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
 * DTO pour les options de recherche de commandes
 */
export interface OrderSearchDTO {
  page?: number;
  limit?: number;
  customerId?: number;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

/**
 * DTO pour la réponse de liste de commandes
 */
export interface OrderListDTO {
  orders: OrderPublicDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * DTO pour les statistiques de commandes
 */
export interface OrderStatisticsDTO {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  ordersByStatus: Record<string, number>;
  revenueByMonth: Record<string, number>;
}

/**
 * DTO pour créer une commande complète depuis un checkout
 * Inclut la commande, les items et les adresses en une seule transaction
 */
export interface OrderFromCheckoutDTO {
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
