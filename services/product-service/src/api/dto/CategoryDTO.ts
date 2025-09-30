/**
 * Category DTOs
 * Data transfer objects for category management
 *
 * Architecture : DTO pattern
 * - API request/response validation
 * - Data transformation
 * - Type safety
 */

/**
 * Category creation DTO
 */
export interface CategoryCreateDTO {
  name: string;
  description?: string;
}

/**
 * Category update DTO
 */
export interface CategoryUpdateDTO {
  name?: string;
  description?: string;
}

/**
 * Category public DTO (for API responses)
 */
export interface CategoryPublicDTO {
  id: number;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  productCount?: number;
}
