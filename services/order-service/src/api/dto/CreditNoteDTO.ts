/**
 * CreditNote DTOs
 * Data transfer objects for credit note management
 *
 * Architecture : DTO pattern
 * - API request/response validation
 * - Data transformation
 * - Type safety
 */

/**
 * CreditNote creation DTO
 */
export interface CreditNoteCreateDTO {
  customerId: number;
  orderId: number;
  totalAmountHT: number;
  totalAmountTTC: number;
  reason: string;
  description?: string;
  paymentMethod: string;
  notes?: string;
}

/**
 * CreditNote update DTO
 */
export interface CreditNoteUpdateDTO {
  totalAmountHT?: number;
  totalAmountTTC?: number;
  reason?: string;
  description?: string;
  paymentMethod?: string;
  notes?: string;
}

/**
 * CreditNote public DTO (for API responses)
 */
export interface CreditNotePublicDTO {
  id: number | null;
  customerId: number | null;
  orderId: number | null;
  totalAmountHT: number;
  totalAmountTTC: number;
  reason: string;
  description: string | null;
  issueDate: Date | null;
  paymentMethod: string;
  notes: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}
