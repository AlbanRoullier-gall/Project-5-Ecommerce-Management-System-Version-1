/**
 * DTOs pour le service PDF Export
 * Types partagés pour l'API REST
 */

// ===== TYPES BASÉS SUR OrderExportData =====

/**
 * Données d'export d'une commande
 */
export interface OrderExportData {
  id: number;
  customerId: number | null;
  customerFirstName: string | null;
  customerLastName: string | null;
  customerEmail: string | null;
  customerPhoneNumber: string | null;
  totalAmountHT: number;
  totalAmountTTC: number;
  paymentMethod: string | null;
  notes: string | null;
  delivered: boolean;
  createdAt: Date;
  updatedAt: Date;
  items?: OrderItemExportData[];
  addresses?: AddressExportData[];
}

/**
 * Données d'export d'un article de commande
 */
export interface OrderItemExportData {
  productName: string;
  quantity: number;
  unitPriceHT: number;
  unitPriceTTC: number;
  totalPriceHT: number;
  totalPriceTTC: number;
}

/**
 * Données d'export d'une adresse
 */
export interface AddressExportData {
  type: "billing" | "shipping";
  addressType?: "billing" | "shipping";
  firstName: string;
  lastName: string;
  address: string;
  postalCode: string | null;
  city: string;
  countryName: string;
  phone?: string | null;
}

// ===== TYPES BASÉS SUR CreditNoteExportData =====

/**
 * Données d'export d'un avoir
 */
export interface CreditNoteExportData {
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
  createdAt: Date;
  updatedAt: Date;
  items?: CreditNoteItemExportData[];
}

/**
 * Données d'export d'un article d'avoir
 */
export interface CreditNoteItemExportData {
  productName: string;
  quantity: number;
  unitPriceHT: number;
  unitPriceTTC: number;
  totalPriceHT: number;
  totalPriceTTC: number;
}

// ===== TYPES BASÉS SUR YearExportRequestDTO =====

/**
 * DTO pour la requête d'export par année
 */
export interface YearExportRequestDTO {
  year: number;
  orders: OrderExportData[];
  creditNotes: CreditNoteExportData[];
}

/**
 * DTO pour la requête d'export d'une seule commande (facture)
 */
export interface OrderInvoiceRequestDTO {
  order: OrderExportData;
}
