/**
 * Order DTOs
 * Data transfer objects for order management
 *
 * Architecture : DTO pattern
 * - API request/response validation
 * - Data transformation
 * - Type safety
 */

/**
 * Order creation DTO
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
 * Order update DTO
 */
export interface OrderUpdateDTO {
  customerSnapshot?: any;
  totalAmountHT?: number;
  totalAmountTTC?: number;
  paymentMethod?: string | null;
  notes?: string;
}

/**
 * Order public DTO (for API responses)
 */
export interface OrderPublicDTO {
  id: number;
  customerId: number;
  customerSnapshot: any | null;
  totalAmountHT: number;
  totalAmountTTC: number;
  paymentMethod: string | null;
  notes: string | null;
  customerFirstName?: string;
  customerLastName?: string;
  customerEmail?: string;
}

/**
 * Order list DTO
 */
export interface OrderListDTO {
  page?: number;
  limit?: number;
  search?: string;
  customerId?: number;
  status?: string;
}
