/**
 * Product Mapper
 * DTO to Model and Model to DTO conversions
 *
 * Architecture : Mapper pattern
 * - Data transformation
 * - Type safety
 * - Separation of concerns
 */

import {
  ProductCreateDTO,
  ProductUpdateDTO,
  ProductPublicDTO,
  CategoryCreateDTO,
  CategoryUpdateDTO,
  CategoryPublicDTO,
  ProductImageCreateDTO,
  ProductImageUpdateDTO,
  ProductImagePublicDTO,
} from "../dto";
import { ProductData } from "../../models/Product";
import { CategoryData } from "../../models/Category";
import { ProductImageData } from "../../models/ProductImage";

/**
 * Product Mapper class
 */
export class ProductMapper {
  // ===== PRODUCT MAPPERS =====

  /**
   * Convert ProductCreateDTO to ProductData
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
   * Convert ProductUpdateDTO to ProductData
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
   * Convert Product model to ProductPublicDTO
   */
  static productToPublicDTO(product: any): ProductPublicDTO {
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      vatRate: product.vatRate,
      categoryId: product.categoryId,
      isActive: product.isActive,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      categoryName: product.categoryName,
      images: product.images || [],
    };
  }

  // ===== CATEGORY MAPPERS =====

  /**
   * Convert CategoryCreateDTO to CategoryData
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
   * Convert CategoryUpdateDTO to CategoryData
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
   * Convert Category model to CategoryPublicDTO
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

  // ===== PRODUCT IMAGE MAPPERS =====

  /**
   * Convert ProductImageCreateDTO to ProductImageData
   */
  static productImageCreateDTOToProductImageData(
    dto: ProductImageCreateDTO
  ): Partial<ProductImageData> {
    return {
      product_id: dto.productId,
      filename: dto.filename,
      file_path: dto.filePath,
      file_size: dto.fileSize,
      mime_type: dto.mimeType,
      width: dto.width || 0,
      height: dto.height || 0,
      alt_text: dto.altText || "",
      description: dto.description || "",
      order_index: dto.orderIndex || 0,
    };
  }

  /**
   * Convert ProductImageUpdateDTO to ProductImageData
   */
  static productImageUpdateDTOToProductImageData(
    dto: ProductImageUpdateDTO
  ): Partial<ProductImageData> {
    const data: Partial<ProductImageData> = {};
    if (dto.filename !== undefined) data.filename = dto.filename;
    if (dto.filePath !== undefined) data.file_path = dto.filePath;
    if (dto.fileSize !== undefined) data.file_size = dto.fileSize;
    if (dto.mimeType !== undefined) data.mime_type = dto.mimeType;
    if (dto.width !== undefined) data.width = dto.width;
    if (dto.height !== undefined) data.height = dto.height;
    if (dto.altText !== undefined) data.alt_text = dto.altText;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.orderIndex !== undefined) data.order_index = dto.orderIndex;
    return data;
  }

  /**
   * Convert ProductImage model to ProductImagePublicDTO
   */
  static productImageToPublicDTO(image: any): ProductImagePublicDTO {
    return {
      id: image.id,
      productId: image.productId,
      filename: image.filename,
      filePath: image.filePath,
      fileSize: image.fileSize,
      mimeType: image.mimeType,
      width: image.width,
      height: image.height,
      altText: image.altText,
      description: image.description,
      orderIndex: image.orderIndex,
      createdAt: image.createdAt,
      updatedAt: image.updatedAt,
    };
  }
}
