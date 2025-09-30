/**
 * OrderItem DTOs
 * Data transfer objects for order items management
 *
 * Architecture : DTO pattern
 * - API request/response validation
 * - Data transformation
 * - Type safety
 */

/**
 * OrderItem creation DTO
 */
export interface OrderItemCreateDTO {
  orderId: number;
  productId: number;
  productSnapshot: any;
  quantity: number;
  unitPriceHT: number;
  unitPriceTTC: number;
  totalPriceHT: number;
  totalPriceTTC: number;
}

/**
 * OrderItem update DTO
 */
export interface OrderItemUpdateDTO {
  productSnapshot?: any;
  quantity?: number;
  unitPriceHT?: number;
  unitPriceTTC?: number;
  totalPriceHT?: number;
  totalPriceTTC?: number;
}

/**
 * OrderItem public DTO (for API responses)
 */
export interface OrderItemPublicDTO {
  id: number | null;
  orderId: number | null;
  productId: number | null;
  productSnapshot: any | null;
  quantity: number;
  unitPriceHT: number;
  unitPriceTTC: number;
  totalPriceHT: number;
  totalPriceTTC: number;
  createdAt: Date | null;
  updatedAt: Date | null;
}
