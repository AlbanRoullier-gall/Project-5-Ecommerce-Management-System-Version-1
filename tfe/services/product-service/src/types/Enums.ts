/**
 * Enums for Product Service
 * Constrained values for type safety and consistency
 */

/**
 * Product status values
 */
export enum ProductStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  DRAFT = "draft",
}

/**
 * Product sort options
 */
export enum ProductSortBy {
  NAME = "name",
  PRICE = "price",
  CREATED_AT = "created_at",
  UPDATED_AT = "updated_at",
}

/**
 * Sort order options
 */
export enum SortOrder {
  ASC = "asc",
  DESC = "desc",
}

/**
 * Image order options
 */
export enum ImageOrderBy {
  ORDER_INDEX = "order_index",
  CREATED_AT = "created_at",
  FILENAME = "filename",
}
