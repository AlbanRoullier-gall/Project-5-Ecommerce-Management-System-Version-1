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

/**
 * Récupère le stock disponible réel d'un produit (stock - réservations actives)
 * @param productId ID du produit
 * @param fallbackStock Stock brut à utiliser en cas d'erreur (optionnel)
 * @returns Stock disponible réel, ou fallbackStock si erreur
 */
export async function getAvailableStock(
  productId: string | number,
  fallbackStock?: number
): Promise<number> {
  try {
    const response = await apiClient.get<
      ApiResponse<{ productId: number; availableStock: number }>
    >(`/api/stock/available/${productId}`);

    if (!response.data || response.data.availableStock === undefined) {
      // Fallback: utiliser le stock brut si fourni, sinon 0
      console.warn(
        `Réponse invalide pour le stock disponible du produit ${productId}, utilisation du fallback`
      );
      return fallbackStock !== undefined ? fallbackStock : 0;
    }

    return response.data.availableStock;
  } catch (error) {
    // En cas d'erreur, utiliser le stock brut comme fallback si fourni
    console.warn(
      `Impossible de récupérer le stock disponible pour le produit ${productId}:`,
      error
    );
    // Si fallbackStock est fourni, l'utiliser (meilleur que 0)
    // Sinon retourner 0 (sera géré par le composant)
    return fallbackStock !== undefined ? fallbackStock : 0;
  }
}
