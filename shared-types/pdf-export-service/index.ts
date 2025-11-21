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
  customerId: number;
  customerSnapshot: any | null;
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
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2?: string | null;
  postalCode: string;
  city: string;
  country: string;
  phone?: string | null;
  email?: string | null;
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

// ===== TYPES BASÉS SUR ExportResponseDTO =====

/**
 * DTO pour la réponse d'export
 */
export interface ExportResponseDTO {
  success: boolean;
  htmlBuffer?: Buffer;
  error?: string;
  filename?: string;
  contentType?: string;
}
