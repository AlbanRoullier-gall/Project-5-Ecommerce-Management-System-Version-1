/**
 * OrderAddress DTOs
 * Data transfer objects for order addresses management
 *
 * Architecture : DTO pattern
 * - API request/response validation
 * - Data transformation
 * - Type safety
 */

import { AddressType } from "../../types/Enums";

/**
 * OrderAddress creation DTO
 */
export interface OrderAddressCreateDTO {
  orderId: number;
  addressType: AddressType;
  addressSnapshot: any;
}

/**
 * OrderAddress update DTO
 */
export interface OrderAddressUpdateDTO {
  addressType?: AddressType;
  addressSnapshot?: any;
}

/**
 * OrderAddress public DTO (for API responses)
 */
export interface OrderAddressPublicDTO {
  id: number;
  orderId: number;
  addressType: AddressType;
  addressSnapshot: any;
  createdAt: Date;
  updatedAt: Date;
}
