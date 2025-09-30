/**
 * ProductImage Repository
 * Database operations for product images
 *
 * Architecture : Repository pattern
 * - Data access abstraction
 * - Database operations
 * - Type safety
 */

import { Pool } from "pg";
import ProductImage, { ProductImageData } from "../models/ProductImage";

export class ProductImageRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  /**
   * Create a new product image
   * @param {ProductImageData} imageData Image data
   * @returns {Promise<ProductImage>} Created image
   */
  async createImage(imageData: ProductImageData): Promise<ProductImage> {
    try {
      const query = `
        INSERT INTO product_images (product_id, filename, file_path, order_index)
        VALUES ($1, $2, $3, $4)
        RETURNING id, product_id, filename, file_path, order_index
      `;

      const values = [
        imageData.product_id,
        imageData.filename,
        imageData.file_path,
        imageData.order_index,
      ];

      const result = await this.pool.query(query, values);
      return new ProductImage(result.rows[0] as ProductImageData);
    } catch (error) {
      console.error("Error creating product image:", error);
      throw error;
    }
  }

  /**
   * Get image by ID
   * @param {number} id Image ID
   * @returns {Promise<ProductImage|null>} Image or null if not found
   */
  async getImageById(id: number): Promise<ProductImage | null> {
    try {
      const query = `
        SELECT id, product_id, filename, file_path, order_index
        FROM product_images 
        WHERE id = $1
      `;

      const result = await this.pool.query(query, [id]);

      if (result.rows.length === 0) {
        return null;
      }

      return new ProductImage(result.rows[0] as ProductImageData);
    } catch (error) {
      console.error("Error getting image by ID:", error);
      throw error;
    }
  }

  /**
   * Update image
   * @param {number} id Image ID
   * @param {Partial<ProductImageData>} imageData Image data to update
   * @returns {Promise<ProductImage|null>} Updated image or null if not found
   */
  async updateImage(
    id: number,
    imageData: Partial<ProductImageData>
  ): Promise<ProductImage | null> {
    try {
      const setClause = [];
      const values = [];
      let paramCount = 0;

      if (imageData.filename !== undefined) {
        setClause.push(`filename = $${++paramCount}`);
        values.push(imageData.filename);
      }
      if (imageData.file_path !== undefined) {
        setClause.push(`file_path = $${++paramCount}`);
        values.push(imageData.file_path);
      }
      if (imageData.order_index !== undefined) {
        setClause.push(`order_index = $${++paramCount}`);
        values.push(imageData.order_index);
      }

      if (setClause.length === 0) {
        throw new Error("No fields to update");
      }

      values.push(id);

      const query = `
        UPDATE product_images 
        SET ${setClause.join(", ")}
        WHERE id = $${++paramCount}
        RETURNING id, product_id, filename, file_path, order_index
      `;

      const result = await this.pool.query(query, values);

      if (result.rows.length === 0) {
        return null;
      }

      return new ProductImage(result.rows[0] as ProductImageData);
    } catch (error) {
      console.error("Error updating image:", error);
      throw error;
    }
  }

  /**
   * Delete image
   * @param {number} id Image ID
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  async deleteImage(id: number): Promise<boolean> {
    try {
      const query = "DELETE FROM product_images WHERE id = $1";
      const result = await this.pool.query(query, [id]);
      return result.rowCount! > 0;
    } catch (error) {
      console.error("Error deleting image:", error);
      throw error;
    }
  }

  /**
   * List images for a product
   * @param {number} productId Product ID
   * @returns {Promise<ProductImage[]>} List of images
   */
  async listImagesByProduct(productId: number): Promise<ProductImage[]> {
    try {
      const query = `
        SELECT id, product_id, filename, file_path, order_index
        FROM product_images 
        WHERE product_id = $1
        ORDER BY order_index ASC
      `;

      const result = await this.pool.query(query, [productId]);
      return result.rows.map(
        (row) => new ProductImage(row as ProductImageData)
      );
    } catch (error) {
      console.error("Error listing images by product:", error);
      throw error;
    }
  }

  /**
   * Delete image by product and image ID
   * @param {number} productId Product ID
   * @param {number} imageId Image ID
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  async deleteImageByProductAndId(
    productId: number,
    imageId: number
  ): Promise<boolean> {
    try {
      const query =
        "DELETE FROM product_images WHERE product_id = $1 AND id = $2";
      const result = await this.pool.query(query, [productId, imageId]);
      return result.rowCount! > 0;
    } catch (error) {
      console.error("Error deleting image by product and ID:", error);
      throw error;
    }
  }
}
