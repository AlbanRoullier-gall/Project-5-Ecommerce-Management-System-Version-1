/**
 * Mapper Produit
 * Conversions DTO vers Modèle et Modèle vers DTO
 *
 * Architecture : Pattern Mapper
 * - Transformation des données
 * - Sécurité des types
 * - Séparation des préoccupations
 */

import {
  ProductCreateDTO,
  ProductUpdateDTO,
  ProductPublicDTO,
  CategoryCreateDTO,
  CategoryUpdateDTO,
  CategoryPublicDTO,
  ProductImagePublicDTO,
} from "../dto";
import { ProductData } from "../../models/Product";
import { CategoryData } from "../../models/Category";

/**
 * Classe Mapper Produit
 */
export class ProductMapper {
  // ===== MAPPERS PRODUIT =====

  /**
   * Convertir ProductCreateDTO vers ProductData
   */
  static productCreateDTOToProductData(
    dto: ProductCreateDTO
  ): Partial<ProductData> {
    return {
      name: dto.name,
      description: dto.description || "",
      price: dto.price,
      vat_rate: dto.vatRate,
      category_id: dto.categoryId,
      is_active: dto.isActive !== undefined ? dto.isActive : true,
    };
  }

  /**
   * Convertir ProductUpdateDTO vers ProductData
   */
  static productUpdateDTOToProductData(
    dto: ProductUpdateDTO
  ): Partial<ProductData> {
    const data: Partial<ProductData> = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.price !== undefined) data.price = dto.price;
    if (dto.vatRate !== undefined) data.vat_rate = dto.vatRate;
    if (dto.categoryId !== undefined) data.category_id = dto.categoryId;
    if (dto.isActive !== undefined) data.is_active = dto.isActive;
    return data;
  }

  /**
   * Convertir le modèle Product vers ProductPublicDTO
   * Calcule le prix TTC côté serveur pour garantir la cohérence et la sécurité
   */
  static productToPublicDTO(product: any): ProductPublicDTO {
    const price = product.price || 0;
    const vatRate = product.vatRate || 0;
    const priceTTC = Math.round(price * (1 + vatRate / 100) * 100) / 100;

    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: price,
      priceTTC: priceTTC,
      vatRate: vatRate,
      categoryId: product.categoryId,
      isActive: product.isActive,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      categoryName: product.categoryName,
      images: product.images || [],
    };
  }

  // ===== MAPPERS CATÉGORIE =====

  /**
   * Convertir CategoryCreateDTO vers CategoryData
   */
  static categoryCreateDTOToCategoryData(
    dto: CategoryCreateDTO
  ): Partial<CategoryData> {
    return {
      name: dto.name,
      description: dto.description || "",
    };
  }

  /**
   * Convertir CategoryUpdateDTO vers CategoryData
   */
  static categoryUpdateDTOToCategoryData(
    dto: CategoryUpdateDTO
  ): Partial<CategoryData> {
    const data: Partial<CategoryData> = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.description !== undefined) data.description = dto.description;
    return data;
  }

  /**
   * Convertir le modèle Category vers CategoryPublicDTO
   */
  static categoryToPublicDTO(category: any): CategoryPublicDTO {
    return {
      id: category.id,
      name: category.name,
      description: category.description,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
      productCount: category.productCount,
    };
  }

  // ===== MAPPERS IMAGE DE PRODUIT =====

  /**
   * Convertir le modèle ProductImage vers ProductImagePublicDTO
   */
  static productImageToPublicDTO(image: any): ProductImagePublicDTO {
    return {
      id: image.id,
      productId: image.productId,
      filename: image.filename,
      filePath: image.filePath,
      orderIndex: image.orderIndex,
    };
  }
}
