/**
 * CreditNoteItem DTOs
 * Data transfer objects for credit note items management
 *
 * Architecture : DTO pattern
 * - API request/response validation
 * - Data transformation
 * - Type safety
 */

/**
 * CreditNoteItem creation DTO
 */
export interface CreditNoteItemCreateDTO {
  creditNoteId: number;
  productId: number;
  quantity: number;
  unitPriceHT: number;
  unitPriceTTC: number;
  totalPriceHT: number;
  totalPriceTTC: number;
}

/**
 * CreditNoteItem update DTO
 */
export interface CreditNoteItemUpdateDTO {
  quantity?: number;
  unitPriceHT?: number;
  unitPriceTTC?: number;
  totalPriceHT?: number;
  totalPriceTTC?: number;
}

/**
 * CreditNoteItem public DTO (for API responses)
 */
export interface CreditNoteItemPublicDTO {
  id: number | null;
  creditNoteId: number | null;
  productId: number | null;
  quantity: number;
  unitPriceHT: number;
  unitPriceTTC: number;
  totalPriceHT: number;
  totalPriceTTC: number;
  createdAt: Date | null;
  updatedAt: Date | null;
}
