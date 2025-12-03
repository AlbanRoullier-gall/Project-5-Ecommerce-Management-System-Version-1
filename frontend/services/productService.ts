/**
 * Service pour les produits
 * Gère tous les appels API liés aux produits
 */

import { apiClient } from "./apiClient";
import {
  ProductPublicDTO,
  ProductSearchDTO,
  CategoryPublicDTO,
  CategorySearchDTO,
} from "../dto";
import { ApiResponse } from "./apiClient";

/**
 * Récupère un produit par son ID
 */
export async function getProduct(
  productId: string | number
): Promise<ProductPublicDTO> {
  const response = await apiClient.get<
    ApiResponse<{ product: ProductPublicDTO }>
  >(`/api/products/${productId}`);

  if (!response.data || !response.data.product) {
    throw new Error("Format de réponse invalide pour le produit");
  }

  return response.data.product;
}

/**
 * Récupère la liste des produits avec filtres
 */
export async function getProducts(
  filters?: Partial<ProductSearchDTO>
): Promise<{ products: ProductPublicDTO[]; total: number }> {
  // Construire les paramètres de requête
  const queryParams = new URLSearchParams();
  if (filters?.search) queryParams.set("search", filters.search);
  if (filters?.categoryId)
    queryParams.set("categoryId", String(filters.categoryId));
  if (filters?.isActive !== undefined)
    queryParams.set("activeOnly", String(filters.isActive));
  if (filters?.sortBy) queryParams.set("sortBy", filters.sortBy);
  if (filters?.sortOrder) queryParams.set("sortOrder", filters.sortOrder);

  const queryString = queryParams.toString();
  const endpoint = queryString
    ? `/api/products?${queryString}`
    : `/api/products`;

  const response = await apiClient.get<
    ApiResponse<{ products: ProductPublicDTO[] }>
  >(endpoint);

  if (!response.data || !Array.isArray(response.data.products)) {
    throw new Error("Format de réponse invalide pour les produits");
  }

  return {
    products: response.data.products,
    total: response.data.products.length,
  };
}

/**
 * Récupère la liste des catégories avec filtres
 */
export async function getCategories(
  filters?: Partial<CategorySearchDTO>
): Promise<CategoryPublicDTO[]> {
  // Construire les paramètres de requête
  const queryParams = new URLSearchParams();
  if (filters?.search) queryParams.set("search", filters.search);
  if (filters?.sortBy) queryParams.set("sortBy", filters.sortBy);
  if (filters?.sortOrder) queryParams.set("sortOrder", filters.sortOrder);

  const queryString = queryParams.toString();
  const endpoint = queryString
    ? `/api/categories?${queryString}`
    : `/api/categories`;

  const response = await apiClient.get<
    ApiResponse<{ categories: CategoryPublicDTO[] }>
  >(endpoint);

  if (!response.data || !Array.isArray(response.data.categories)) {
    throw new Error("Format de réponse invalide pour les catégories");
  }

  return response.data.categories;
}
