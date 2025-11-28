/**
 * DTOs pour le service produit
 * Types partagés pour l'API REST
 */
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
}
/**
 * DTO public pour un produit
 * Basé sur ProductData avec informations de catégorie
 */
export interface ProductPublicDTO {
    id: number;
    name: string;
    description: string | null;
    price: number;
    priceTTC: number;
    vatRate: number;
    categoryId: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    categoryName?: string;
    images?: ProductImagePublicDTO[];
}
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
/**
 * DTO pour la création d'une image de produit
 * Basé sur ProductImageData avec conversion camelCase
 */
export interface ProductImageCreateDTO {
    productId: number;
    filename: string;
    filePath: string;
    orderIndex: number;
}
/**
 * DTO pour la mise à jour d'une image de produit
 * Utilise Partial pour rendre tous les champs optionnels
 */
export interface ProductImageUpdateDTO {
    filename?: string;
    filePath?: string;
    orderIndex?: number;
}
/**
 * DTO public pour une image de produit
 * Basé sur ProductImageData
 */
export interface ProductImagePublicDTO {
    id: number;
    productId: number;
    filename: string;
    filePath: string;
    orderIndex: number;
}
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
 * DTO pour les statistiques de produits
 */
export interface ProductStatsDTO {
    totalProducts: number;
    activeProducts: number;
    inactiveProducts: number;
    totalCategories: number;
    averagePrice: number;
    productsByCategory: Record<string, number>;
}
/**
 * DTO pour l'upload d'image
 */
export interface ProductImageUploadDTO {
    productId: number;
    file: File;
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
 * DTO pour les variantes d'image
 */
export interface ProductImageVariantDTO {
    id: string;
    width: number;
    height: number;
    url: string;
    format: string;
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
/**
 * DTO pour les métadonnées de produit
 */
export interface ProductMetadataDTO {
    seoTitle?: string;
    seoDescription?: string;
    tags?: string[];
    weight?: number;
    dimensions?: {
        width: number;
        height: number;
        depth: number;
    };
    sku?: string;
    barcode?: string;
}
//# sourceMappingURL=index.d.ts.map