/**
 * OrderAddress DTOs
 * Data transfer objects for order addresses management
 *
 * Architecture : DTO pattern
 * - API request/response validation
 * - Data transformation
 * - Type safety
 */

/**
 * OrderAddress creation DTO
 */
export interface OrderAddressCreateDTO {
  orderId: number;
  addressType: string;
  addressSnapshot: any;
}

/**
 * OrderAddress update DTO
 */
export interface OrderAddressUpdateDTO {
  addressType?: string;
  addressSnapshot?: any;
}

/**
 * OrderAddress public DTO (for API responses)
 */
export interface OrderAddressPublicDTO {
  id: number | null;
  orderId: number | null;
  addressType: string;
  addressSnapshot: any;
  createdAt: Date | null;
  updatedAt: Date | null;
}
