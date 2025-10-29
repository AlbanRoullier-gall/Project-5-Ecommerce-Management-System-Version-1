/**
 * Énumérations pour le Service Produit
 * Valeurs contraintes pour la sécurité des types et la cohérence
 */

/**
 * Valeurs de statut de produit
 */
export enum ProductStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  DRAFT = "draft",
}

/**
 * Options de tri de produit
 */
export enum ProductSortBy {
  NAME = "name",
  PRICE = "price",
  CREATED_AT = "created_at",
  UPDATED_AT = "updated_at",
}

/**
 * Options d'ordre de tri
 */
export enum SortOrder {
  ASC = "asc",
  DESC = "desc",
}

/**
 * Options d'ordre d'image
 */
export enum ImageOrderBy {
  ORDER_INDEX = "order_index",
  CREATED_AT = "created_at",
  FILENAME = "filename",
}
