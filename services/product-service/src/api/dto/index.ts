/**
 * DTOs index
 * Exporte tous les DTOs depuis shared-types
 *
 * Note: Utilisation d'imports directs pour éviter les problèmes de résolution TypeScript
 */

// Import direct depuis shared-types
export type {
  ProductCreateDTO,
  ProductUpdateDTO,
  ProductPublicDTO,
  CategoryCreateDTO,
  CategoryUpdateDTO,
  CategoryPublicDTO,
  ProductImagePublicDTO,
  ProductListRequestDTO,
  CategorySearchDTO,
} from "../../../../../shared-types/product-service";
