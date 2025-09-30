/**
 * Product DTOs
 * Data transfer objects for product management
 *
 * Architecture : DTO pattern
 * - API request/response validation
 * - Data transformation
 * - Type safety
 */

import { ProductSortBy, SortOrder } from "../../types/Enums";

/**
 * Product creation DTO
 */
export interface ProductCreateDTO {
  name: string;
  description?: string;
  price: number;
  vatRate: number;
  categoryId: number;
  isActive: boolean;
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
  id: number;
  name: string;
  description: string;
  price: number;
  vatRate: number;
  categoryId: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
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
  sortBy?: ProductSortBy;
  sortOrder?: SortOrder;
}
