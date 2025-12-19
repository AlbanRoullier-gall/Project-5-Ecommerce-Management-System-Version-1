/**
 * DTOs pour le service produit
 * Types partagés pour l'API REST
 */

// ===== TYPES BASÉS SUR ProductData =====

/**
 * DTO pour la création d'un produit
 * Basé sur ProductData avec conversion camelCase
 */
export interface ProductCreateDTO {
  name: string;
  description?: string;
  price: number;
  vatRate: number;
  categoryId: number;
  isActive?: boolean;
  stock?: number;
}

/**
 * DTO pour la mise à jour d'un produit
 * Utilise Partial pour rendre tous les champs optionnels
 */
export interface ProductUpdateDTO {
  name?: string;
  description?: string;
  price?: number;
  vatRate?: number;
  categoryId?: number;
  isActive?: boolean;
  stock?: number;
}

/**
 * DTO public pour un produit
 * Basé sur ProductData avec informations de catégorie
 */
export interface ProductPublicDTO {
  id: number;
  name: string;
  description: string | null;
  price: number; // Prix HT
  priceTTC: number; // Prix TTC calculé côté serveur
  vatRate: number;
  categoryId: number;
  isActive: boolean;
  stock: number;
  createdAt: Date;
  updatedAt: Date;
  categoryName?: string;
  images?: ProductImagePublicDTO[];
}

// ===== TYPES BASÉS SUR CategoryData =====

/**
 * DTO pour la création d'une catégorie
 * Basé sur CategoryData avec conversion camelCase
 */
export interface CategoryCreateDTO {
  name: string;
  description?: string;
}

/**
 * DTO pour la mise à jour d'une catégorie
 * Utilise Partial pour rendre tous les champs optionnels
 */
export interface CategoryUpdateDTO {
  name?: string;
  description?: string;
}

/**
 * DTO public pour une catégorie
 * Basé sur CategoryData
 */
export interface CategoryPublicDTO {
  id: number;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  productCount?: number;
}

// ===== TYPES BASÉS SUR ProductImageData =====

/**
 * DTO public pour une image de produit
 * Basé sur ProductImageData
 */
export interface ProductImagePublicDTO {
  id: number;
  productId: number;
  filename: string;
  orderIndex: number;
}

// ===== TYPES SPÉCIFIQUES =====

/**
 * DTO pour les options de recherche de produits
 */
export interface ProductSearchDTO {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  isActive?: boolean;
  sortBy?: "name" | "price" | "createdAt";
  sortOrder?: "asc" | "desc";
}

/**
 * DTO pour les options de liste de produits (requête complète)
 * Extension de ProductSearchDTO avec support pour plusieurs catégories et activeOnly
 */
export interface ProductListRequestDTO {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: number;
  categories?: number[]; // Support pour plusieurs catégories
  minPrice?: number;
  maxPrice?: number;
  activeOnly?: boolean; // Filtre pour produits actifs uniquement
  sortBy?: "name" | "price" | "createdAt" | "created_at";
  sortOrder?: "asc" | "desc";
}

/**
 * DTO pour les options de recherche de catégories
 */
export interface CategorySearchDTO {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: "name" | "createdAt";
  sortOrder?: "asc" | "desc";
}

/**
 * DTO pour la réponse de liste de produits
 */
export interface ProductListDTO {
  products: ProductPublicDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * DTO pour la réponse de liste de catégories
 */
export interface CategoryListDTO {
  categories: CategoryPublicDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * DTO pour l'upload d'image (utilise base64 au lieu de File)
 */
export interface ProductImageUploadDTO {
  productId: number;
  filename: string;
  base64Data: string; // Image encodée en base64 (sans le préfixe data:image/...)
  mimeType: string; // Ex: "image/jpeg", "image/png"
  orderIndex?: number;
}

/**
 * DTO pour la réponse d'upload d'image
 */
export interface ProductImageUploadResponseDTO {
  success: boolean;
  image?: ProductImagePublicDTO;
  error?: string;
}

/**
 * DTO pour les options de filtrage avancé
 */
export interface ProductFilterDTO {
  categories?: number[];
  priceRange?: {
    min: number;
    max: number;
  };
  isActive?: boolean;
  hasImages?: boolean;
  dateRange?: {
    from: Date;
    to: Date;
  };
}
