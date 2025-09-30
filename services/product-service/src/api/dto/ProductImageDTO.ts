/**
 * ProductImage DTOs
 * Data transfer objects for product image management
 *
 * Architecture : DTO pattern
 * - API request/response validation
 * - Data transformation
 * - Type safety
 */

/**
 * ProductImage creation DTO
 */
export interface ProductImageCreateDTO {
  productId: number;
  filename: string;
  filePath: string;
  orderIndex?: number;
}

/**
 * ProductImage update DTO
 */
export interface ProductImageUpdateDTO {
  filename?: string;
  filePath?: string;
  orderIndex?: number;
}

/**
 * ProductImage public DTO (for API responses)
 */
export interface ProductImagePublicDTO {
  id: number;
  productId: number;
  filename: string;
  filePath: string;
  orderIndex: number;
}
