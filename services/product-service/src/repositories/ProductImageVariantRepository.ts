/**
 * ProductImageVariantRepository
 * Handles database operations for ProductImageVariant entities
 */
import { Pool } from "pg";
import ProductImageVariant from "../models/ProductImageVariant";

export default class ProductImageVariantRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  /**
   * Get variant by ID
   * @param {number} id Variant ID
   * @returns {Promise<ProductImageVariant|null>} ProductImageVariant or null if not found
   */
  async getById(id: number): Promise<ProductImageVariant | null> {
    try {
      const result = await this.pool.query(
        `SELECT id, image_id, variant_type, file_path, width, height, file_size, 
                quality, created_at
         FROM product_image_variants 
         WHERE id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return ProductImageVariant.fromDbRow(result.rows[0]);
    } catch (error) {
      console.error("Error getting variant by ID:", error);
      throw new Error("Failed to retrieve variant");
    }
  }

  /**
   * List variants by image ID
   * @param {number} imageId Image ID
   * @returns {Promise<ProductImageVariant[]>} Array of variants
   */
  async listByImage(imageId: number): Promise<ProductImageVariant[]> {
    try {
      const result = await this.pool.query(
        `SELECT id, image_id, variant_type, file_path, width, height, file_size, 
                quality, created_at
         FROM product_image_variants 
         WHERE image_id = $1
         ORDER BY created_at`,
        [imageId]
      );

      return result.rows.map((row) => ProductImageVariant.fromDbRow(row));
    } catch (error) {
      console.error("Error listing variants by image:", error);
      throw new Error("Failed to retrieve variants");
    }
  }

  /**
   * Get variant by image ID and type
   * @param {number} imageId Image ID
   * @param {string} variantType Variant type
   * @returns {Promise<ProductImageVariant|null>} Variant or null if not found
   */
  async getByImageAndType(
    imageId: number,
    variantType: string
  ): Promise<ProductImageVariant | null> {
    try {
      const result = await this.pool.query(
        `SELECT id, image_id, variant_type, file_path, width, height, file_size, 
                quality, created_at
         FROM product_image_variants 
         WHERE image_id = $1 AND variant_type = $2`,
        [imageId, variantType]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return ProductImageVariant.fromDbRow(result.rows[0]);
    } catch (error) {
      console.error("Error getting variant by image and type:", error);
      throw new Error("Failed to retrieve variant");
    }
  }

  /**
   * Save new variant
   * @param {ProductImageVariant} variant Variant entity to save
   * @returns {Promise<ProductImageVariant>} Saved variant with ID
   */
  async save(variant: ProductImageVariant): Promise<ProductImageVariant> {
    try {
      const validation = variant.validate();
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
      }

      const result = await this.pool.query(
        `INSERT INTO product_image_variants (image_id, variant_type, file_path, 
                                            width, height, file_size, quality, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
         RETURNING id, image_id, variant_type, file_path, width, height, file_size, 
                   quality, created_at`,
        [
          variant.imageId,
          variant.variantType,
          variant.filePath,
          variant.width,
          variant.height,
          variant.fileSize,
          variant.quality,
        ]
      );

      return ProductImageVariant.fromDbRow(result.rows[0]);
    } catch (error) {
      console.error("Error saving variant:", error);
      throw new Error("Failed to save variant");
    }
  }

  /**
   * Update existing variant
   * @param {ProductImageVariant} variant Variant entity to update
   * @returns {Promise<ProductImageVariant>} Updated variant
   */
  async update(variant: ProductImageVariant): Promise<ProductImageVariant> {
    try {
      const validation = variant.validate();
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
      }

      const result = await this.pool.query(
        `UPDATE product_image_variants 
         SET image_id = $1, variant_type = $2, file_path = $3, width = $4, 
             height = $5, file_size = $6, quality = $7
         WHERE id = $8
         RETURNING id, image_id, variant_type, file_path, width, height, file_size, 
                   quality, created_at`,
        [
          variant.imageId,
          variant.variantType,
          variant.filePath,
          variant.width,
          variant.height,
          variant.fileSize,
          variant.quality,
          variant.id,
        ]
      );

      if (result.rows.length === 0) {
        throw new Error("Variant not found");
      }

      return ProductImageVariant.fromDbRow(result.rows[0]);
    } catch (error) {
      console.error("Error updating variant:", error);
      throw new Error("Failed to update variant");
    }
  }

  /**
   * Delete variant
   * @param {ProductImageVariant} variant Variant entity to delete
   * @returns {Promise<boolean>} True if deleted successfully
   */
  async delete(variant: ProductImageVariant): Promise<boolean> {
    try {
      const result = await this.pool.query(
        "DELETE FROM product_image_variants WHERE id = $1 RETURNING id",
        [variant.id]
      );

      return result.rows.length > 0;
    } catch (error) {
      console.error("Error deleting variant:", error);
      throw new Error("Failed to delete variant");
    }
  }

  /**
   * Delete variant by image ID and type
   * @param {number} imageId Image ID
   * @param {string} variantType Variant type
   * @returns {Promise<boolean>} True if deleted successfully
   */
  async deleteByImageAndType(
    imageId: number,
    variantType: string
  ): Promise<boolean> {
    try {
      const result = await this.pool.query(
        "DELETE FROM product_image_variants WHERE image_id = $1 AND variant_type = $2 RETURNING id",
        [imageId, variantType]
      );

      return result.rows.length > 0;
    } catch (error) {
      console.error("Error deleting variant by image and type:", error);
      throw new Error("Failed to delete variant");
    }
  }

  /**
   * Delete all variants for an image
   * @param {number} imageId Image ID
   * @returns {Promise<number>} Number of variants deleted
   */
  async deleteAllByImage(imageId: number): Promise<number> {
    try {
      const result = await this.pool.query(
        "DELETE FROM product_image_variants WHERE image_id = $1 RETURNING id",
        [imageId]
      );

      return result.rows.length;
    } catch (error) {
      console.error("Error deleting all variants by image:", error);
      throw new Error("Failed to delete variants");
    }
  }

  /**
   * Count variants for image
   * @param {number} imageId Image ID
   * @returns {Promise<number>} Number of variants
   */
  async countByImage(imageId: number): Promise<number> {
    try {
      const result = await this.pool.query(
        "SELECT COUNT(*) FROM product_image_variants WHERE image_id = $1",
        [imageId]
      );

      return parseInt(result.rows[0].count);
    } catch (error) {
      console.error("Error counting variants:", error);
      throw new Error("Failed to count variants");
    }
  }

  /**
   * Check if variant exists for image and type
   * @param {number} imageId Image ID
   * @param {string} variantType Variant type
   * @returns {Promise<boolean>} True if variant exists
   */
  async variantExists(imageId: number, variantType: string): Promise<boolean> {
    try {
      const result = await this.pool.query(
        "SELECT id FROM product_image_variants WHERE image_id = $1 AND variant_type = $2",
        [imageId, variantType]
      );

      return result.rows.length > 0;
    } catch (error) {
      console.error("Error checking variant existence:", error);
      throw new Error("Failed to check variant existence");
    }
  }
}
