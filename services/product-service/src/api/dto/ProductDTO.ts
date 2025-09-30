/**
 * Product DTOs
 * Data transfer objects for product management
 *
 * Architecture : DTO pattern
 * - API request/response validation
 * - Data transformation
 * - Type safety
 */

/**
 * Product creation DTO
 */
export interface ProductCreateDTO {
  name: string;
  description?: string;
  price: number;
  vatRate: number;
  categoryId: number;
  isActive?: boolean;
}

/**
 * Product update DTO
 */
export interface ProductUpdateDTO {
  name?: string;
  description?: string;
  price?: number;
  vatRate?: number;
  categoryId?: number;
  isActive?: boolean;
}

/**
 * Product public DTO (for API responses)
 */
export interface ProductPublicDTO {
  id: number | null;
  name: string;
  description: string;
  price: number;
  vatRate: number;
  categoryId: number | null;
  isActive: boolean;
  createdAt: Date | null;
  updatedAt: Date | null;
  categoryName?: string;
  images?: any[];
}

/**
 * Product list options DTO
 */
export interface ProductListOptions {
  page: number;
  limit: number;
  categoryId?: number;
  search?: string;
  activeOnly?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
