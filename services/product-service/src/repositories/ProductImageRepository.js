/**
 * ProductImageRepository
 * Handles database operations for ProductImage entities
 */
const ProductImage = require("../models/ProductImage");

class ProductImageRepository {
  constructor(pool) {
    this.pool = pool;
  }

  /**
   * Get image by ID
   * @param {number} id Image ID
   * @returns {Promise<ProductImage|null>} ProductImage or null if not found
   */
  async getById(id) {
    try {
      const result = await this.pool.query(
        `SELECT id, product_id, filename, file_path, file_size, mime_type, width, 
                height, alt_text, description, is_active, order_index, created_at, updated_at
         FROM product_images 
         WHERE id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return ProductImage.fromDbRow(result.rows[0]);
    } catch (error) {
      console.error("Error getting image by ID:", error);
      throw new Error("Failed to retrieve image");
    }
  }

  /**
   * List images by product ID
   * @param {number} productId Product ID
   * @returns {Promise<ProductImage[]>} Array of images
   */
  async listByProduct(productId) {
    try {
      const result = await this.pool.query(
        `SELECT id, product_id, filename, file_path, file_size, mime_type, width, 
                height, alt_text, description, is_active, order_index, created_at, updated_at
         FROM product_images 
         WHERE product_id = $1
         ORDER BY order_index, created_at`,
        [productId]
      );

      return result.rows.map((row) => ProductImage.fromDbRow(row));
    } catch (error) {
      console.error("Error listing images by product:", error);
      throw new Error("Failed to retrieve images");
    }
  }

  /**
   * List active images by product ID
   * @param {number} productId Product ID
   * @returns {Promise<ProductImage[]>} Array of active images
   */
  async listActiveByProduct(productId) {
    try {
      const result = await this.pool.query(
        `SELECT id, product_id, filename, file_path, file_size, mime_type, width, 
                height, alt_text, description, is_active, order_index, created_at, updated_at
         FROM product_images 
         WHERE product_id = $1 AND is_active = true
         ORDER BY order_index, created_at`,
        [productId]
      );

      return result.rows.map((row) => ProductImage.fromDbRow(row));
    } catch (error) {
      console.error("Error listing active images by product:", error);
      throw new Error("Failed to retrieve active images");
    }
  }

  /**
   * Save new image
   * @param {ProductImage} image Image entity to save
   * @returns {Promise<ProductImage>} Saved image with ID
   */
  async save(image) {
    try {
      const validation = image.validate();
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
      }

      const result = await this.pool.query(
        `INSERT INTO product_images (product_id, filename, file_path, file_size, 
                                   mime_type, width, height, alt_text, description, 
                                   is_active, order_index, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
         RETURNING id, product_id, filename, file_path, file_size, mime_type, 
                   width, height, alt_text, description, is_active, order_index, 
                   created_at, updated_at`,
        [
          image.productId,
          image.filename,
          image.filePath,
          image.fileSize,
          image.mimeType,
          image.width,
          image.height,
          image.altText,
          image.description,
          image.isActive,
          image.orderIndex,
        ]
      );

      return ProductImage.fromDbRow(result.rows[0]);
    } catch (error) {
      console.error("Error saving image:", error);
      throw new Error("Failed to save image");
    }
  }

  /**
   * Update existing image
   * @param {ProductImage} image Image entity to update
   * @returns {Promise<ProductImage>} Updated image
   */
  async update(image) {
    try {
      const validation = image.validate();
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
      }

      const result = await this.pool.query(
        `UPDATE product_images 
         SET product_id = $1, filename = $2, file_path = $3, file_size = $4, 
             mime_type = $5, width = $6, height = $7, alt_text = $8, 
             description = $9, is_active = $10, order_index = $11, updated_at = NOW()
         WHERE id = $12
         RETURNING id, product_id, filename, file_path, file_size, mime_type, 
                   width, height, alt_text, description, is_active, order_index, 
                   created_at, updated_at`,
        [
          image.productId,
          image.filename,
          image.filePath,
          image.fileSize,
          image.mimeType,
          image.width,
          image.height,
          image.altText,
          image.description,
          image.isActive,
          image.orderIndex,
          image.id,
        ]
      );

      if (result.rows.length === 0) {
        throw new Error("Image not found");
      }

      return ProductImage.fromDbRow(result.rows[0]);
    } catch (error) {
      console.error("Error updating image:", error);
      throw new Error("Failed to update image");
    }
  }

  /**
   * Delete image
   * @param {ProductImage} image Image entity to delete
   * @returns {Promise<boolean>} True if deleted successfully
   */
  async delete(image) {
    try {
      const result = await this.pool.query(
        "DELETE FROM product_images WHERE id = $1 RETURNING id",
        [image.id]
      );

      return result.rows.length > 0;
    } catch (error) {
      console.error("Error deleting image:", error);
      throw new Error("Failed to delete image");
    }
  }

  /**
   * Activate image
   * @param {number} id Image ID
   * @returns {Promise<boolean>} True if activated successfully
   */
  async activate(id) {
    try {
      const result = await this.pool.query(
        "UPDATE product_images SET is_active = true, updated_at = NOW() WHERE id = $1 RETURNING id",
        [id]
      );

      return result.rows.length > 0;
    } catch (error) {
      console.error("Error activating image:", error);
      throw new Error("Failed to activate image");
    }
  }

  /**
   * Deactivate image
   * @param {number} id Image ID
   * @returns {Promise<boolean>} True if deactivated successfully
   */
  async deactivate(id) {
    try {
      const result = await this.pool.query(
        "UPDATE product_images SET is_active = false, updated_at = NOW() WHERE id = $1 RETURNING id",
        [id]
      );

      return result.rows.length > 0;
    } catch (error) {
      console.error("Error deactivating image:", error);
      throw new Error("Failed to deactivate image");
    }
  }

  /**
   * Update image order
   * @param {number} id Image ID
   * @param {number} orderIndex New order index
   * @returns {Promise<boolean>} True if updated successfully
   */
  async updateOrder(id, orderIndex) {
    try {
      const result = await this.pool.query(
        "UPDATE product_images SET order_index = $1, updated_at = NOW() WHERE id = $2 RETURNING id",
        [orderIndex, id]
      );

      return result.rows.length > 0;
    } catch (error) {
      console.error("Error updating image order:", error);
      throw new Error("Failed to update image order");
    }
  }

  /**
   * Count images for product
   * @param {number} productId Product ID
   * @returns {Promise<number>} Number of images
   */
  async countByProduct(productId) {
    try {
      const result = await this.pool.query(
        "SELECT COUNT(*) FROM product_images WHERE product_id = $1",
        [productId]
      );

      return parseInt(result.rows[0].count);
    } catch (error) {
      console.error("Error counting images:", error);
      throw new Error("Failed to count images");
    }
  }

  /**
   * Get next order index for product
   * @param {number} productId Product ID
   * @returns {Promise<number>} Next order index
   */
  async getNextOrderIndex(productId) {
    try {
      const result = await this.pool.query(
        "SELECT MAX(order_index) FROM product_images WHERE product_id = $1",
        [productId]
      );

      return (result.rows[0].max || 0) + 1;
    } catch (error) {
      console.error("Error getting next order index:", error);
      throw new Error("Failed to get next order index");
    }
  }
}

module.exports = ProductImageRepository;
