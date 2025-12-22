/**
 * Service pour les produits (backoffice)
 * Gère tous les appels API liés aux produits admin
 */

import { apiClient } from "./apiClient";
import {
  ProductPublicDTO,
  ProductCreateDTO,
  ProductUpdateDTO,
  ProductSearchDTO,
  ProductFilterDTO,
  CategoryPublicDTO,
  CategoryCreateDTO,
  CategoryUpdateDTO,
  CategorySearchDTO,
  ProductImageUploadDTO,
  ProductImageUploadResponseDTO,
} from "dto";
import { ApiResponse } from "./apiClient";

/**
 * Récupère la liste des produits avec filtres
 */
export async function getProducts(
  searchParams?: Partial<ProductSearchDTO>,
  filterParams?: Partial<ProductFilterDTO>
): Promise<{ products: ProductPublicDTO[] }> {
  const queryParams = new URLSearchParams();

  if (searchParams?.search) queryParams.set("search", searchParams.search);
  if (searchParams?.categoryId)
    queryParams.set("categoryId", String(searchParams.categoryId));
  if (searchParams?.isActive !== undefined && searchParams.isActive !== null)
    queryParams.set("activeOnly", String(searchParams.isActive));
  if (searchParams?.sortBy) queryParams.set("sortBy", searchParams.sortBy);
  if (searchParams?.sortOrder)
    queryParams.set("sortOrder", searchParams.sortOrder);

  if (filterParams?.categories && filterParams.categories.length > 0)
    queryParams.set("categories", filterParams.categories.join(","));
  if (filterParams?.priceRange) {
    if (filterParams.priceRange.min !== undefined)
      queryParams.set("minPrice", String(filterParams.priceRange.min));
    if (filterParams.priceRange.max !== undefined)
      queryParams.set("maxPrice", String(filterParams.priceRange.max));
  }

  const queryString = queryParams.toString();
  const endpoint = queryString
    ? `/api/admin/products?${queryString}`
    : `/api/admin/products`;

  const response = await apiClient.get<
    ApiResponse<{ products: ProductPublicDTO[] }>
  >(endpoint);

  if (!response.data || !Array.isArray(response.data.products)) {
    throw new Error("Format de réponse invalide pour les produits");
  }

  return { products: response.data.products };
}

/**
 * Récupère un produit par son ID
 */
export async function getProduct(productId: number): Promise<ProductPublicDTO> {
  const response = await apiClient.get<
    ApiResponse<{ product: ProductPublicDTO }>
  >(`/api/admin/products/${productId}`);

  if (!response.data || !response.data.product) {
    throw new Error("Format de réponse invalide pour le produit");
  }

  return response.data.product;
}

/**
 * Crée un produit
 */
export async function createProduct(
  productData: ProductCreateDTO
): Promise<ProductPublicDTO> {
  const response = await apiClient.post<
    ApiResponse<{ product: ProductPublicDTO }>
  >("/api/admin/products", productData);

  if (!response.data || !response.data.product) {
    throw new Error("Format de réponse invalide pour le produit créé");
  }

  return response.data.product;
}

/**
 * Met à jour un produit
 */
export async function updateProduct(
  productId: number,
  productData: ProductUpdateDTO
): Promise<ProductPublicDTO> {
  const response = await apiClient.put<
    ApiResponse<{ product: ProductPublicDTO }>
  >(`/api/admin/products/${productId}`, productData);

  if (!response.data || !response.data.product) {
    throw new Error("Format de réponse invalide pour le produit mis à jour");
  }

  return response.data.product;
}

/**
 * Supprime un produit
 */
export async function deleteProduct(productId: number): Promise<void> {
  await apiClient.delete(`/api/admin/products/${productId}`);
}

/**
 * Active un produit
 */
export async function activateProduct(productId: number): Promise<void> {
  await apiClient.post(`/api/admin/products/${productId}/activate`);
}

/**
 * Désactive un produit
 */
export async function deactivateProduct(productId: number): Promise<void> {
  await apiClient.post(`/api/admin/products/${productId}/deactivate`);
}

/**
 * Récupère la liste des catégories avec filtres
 */
export async function getCategories(
  filters?: Partial<CategorySearchDTO>
): Promise<{ categories: CategoryPublicDTO[] }> {
  const queryParams = new URLSearchParams();
  if (filters?.search) queryParams.set("search", filters.search);
  if (filters?.sortBy) queryParams.set("sortBy", filters.sortBy);
  if (filters?.sortOrder) queryParams.set("sortOrder", filters.sortOrder);

  const queryString = queryParams.toString();
  const endpoint = queryString
    ? `/api/admin/categories?${queryString}`
    : `/api/admin/categories`;

  const response = await apiClient.get<
    ApiResponse<{ categories: CategoryPublicDTO[] }>
  >(endpoint);

  if (!response.data || !Array.isArray(response.data.categories)) {
    throw new Error("Format de réponse invalide pour les catégories");
  }

  return { categories: response.data.categories };
}

/**
 * Crée une catégorie
 */
export async function createCategory(
  categoryData: CategoryCreateDTO
): Promise<CategoryPublicDTO> {
  const response = await apiClient.post<
    ApiResponse<{ category: CategoryPublicDTO }>
  >("/api/admin/categories", categoryData);

  if (!response.data || !response.data.category) {
    throw new Error("Format de réponse invalide pour la catégorie créée");
  }

  return response.data.category;
}

/**
 * Met à jour une catégorie
 */
export async function updateCategory(
  categoryId: number,
  categoryData: CategoryUpdateDTO
): Promise<CategoryPublicDTO> {
  const response = await apiClient.put<
    ApiResponse<{ category: CategoryPublicDTO }>
  >(`/api/admin/categories/${categoryId}`, categoryData);

  if (!response.data || !response.data.category) {
    throw new Error("Format de réponse invalide pour la catégorie mise à jour");
  }

  return response.data.category;
}

/**
 * Supprime une catégorie
 */
export async function deleteCategory(categoryId: number): Promise<void> {
  await apiClient.delete(`/api/admin/categories/${categoryId}`);
}

/**
 * Upload une image pour un produit
 */
export async function uploadProductImage(
  imageData: ProductImageUploadDTO
): Promise<ProductImageUploadResponseDTO> {
  const response = await apiClient.post<ProductImageUploadResponseDTO>(
    `/api/admin/products/${imageData.productId}/images/upload`,
    imageData
  );
  return response;
}

/**
 * Upload plusieurs images pour un produit
 */
export async function uploadProductImages(
  productId: number,
  images: ProductImageUploadDTO[]
): Promise<ProductImageUploadResponseDTO> {
  const response = await apiClient.post<
    ApiResponse<ProductImageUploadResponseDTO> | ProductImageUploadResponseDTO
  >(`/api/admin/products/${productId}/images/upload`, images);

  // Gérer les deux formats de réponse possibles
  if (response && typeof response === "object") {
    // Si la réponse est encapsulée dans ApiResponse
    if ("data" in response && response.data) {
      return response.data as ProductImageUploadResponseDTO;
    }
    // Si la réponse est directement ProductImageUploadResponseDTO
    if ("success" in response || "images" in response) {
      return response as ProductImageUploadResponseDTO;
    }
  }

  // Fallback : convertir via unknown pour éviter l'erreur TypeScript
  return response as unknown as ProductImageUploadResponseDTO;
}

/**
 * Supprime une image de produit
 */
export async function deleteProductImage(
  productId: number,
  imageId: number
): Promise<void> {
  await apiClient.delete(`/api/admin/products/${productId}/images/${imageId}`);
}
