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
  fileSize: number;
  mimeType: string;
  width?: number;
  height?: number;
  altText?: string;
  description?: string;
  orderIndex?: number;
}

/**
 * ProductImage update DTO
 */
export interface ProductImageUpdateDTO {
  filename?: string;
  filePath?: string;
  fileSize?: number;
  mimeType?: string;
  width?: number;
  height?: number;
  altText?: string;
  description?: string;
  orderIndex?: number;
}

/**
 * ProductImage public DTO (for API responses)
 */
export interface ProductImagePublicDTO {
  id: number | null;
  productId: number | null;
  filename: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  width: number;
  height: number;
  altText: string;
  description: string;
  orderIndex: number;
  createdAt: Date | null;
  updatedAt: Date | null;
}
