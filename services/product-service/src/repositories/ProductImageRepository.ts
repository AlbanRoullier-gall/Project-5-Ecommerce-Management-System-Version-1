/**
 * ProductImage Repository
 * Database operations for product images
 *
 * Architecture : Repository pattern
 * - Data access abstraction
 * - Database operations
 * - Type safety
 */

import { Pool } from 'pg';
import ProductImage, { ProductImageData } from '../models/ProductImage';

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
        INSERT INTO product_images (product_id, filename, file_path, file_size, mime_type, 
                                   width, height, alt_text, description, is_active, order_index, 
                                   created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
        RETURNING id, product_id, filename, file_path, file_size, mime_type, width, height, 
                  alt_text, description, is_active, order_index, created_at, updated_at
      `;

      const values = [
        imageData.product_id,
        imageData.filename,
        imageData.file_path,
        imageData.file_size,
        imageData.mime_type,
        imageData.width,
        imageData.height,
        imageData.alt_text,
        imageData.description,
        imageData.is_active,
        imageData.order_index,
      ];

      const result = await this.pool.query(query, values);
      return new ProductImage(result.rows[0] as ProductImageData);
    } catch (error) {
      console.error('Error creating product image:', error);
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
        SELECT id, product_id, filename, file_path, file_size, mime_type, width, height, 
               alt_text, description, is_active, order_index, created_at, updated_at
        FROM product_images 
        WHERE id = $1
      `;

      const result = await this.pool.query(query, [id]);
      
      if (result.rows.length === 0) {
        return null;
      }

      return new ProductImage(result.rows[0] as ProductImageData);
    } catch (error) {
      console.error('Error getting image by ID:', error);
      throw error;
    }
  }

  /**
   * Update image
   * @param {number} id Image ID
   * @param {Partial<ProductImageData>} imageData Image data to update
   * @returns {Promise<ProductImage|null>} Updated image or null if not found
   */
  async updateImage(id: number, imageData: Partial<ProductImageData>): Promise<ProductImage | null> {
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
      if (imageData.file_size !== undefined) {
        setClause.push(`file_size = $${++paramCount}`);
        values.push(imageData.file_size);
      }
      if (imageData.mime_type !== undefined) {
        setClause.push(`mime_type = $${++paramCount}`);
        values.push(imageData.mime_type);
      }
      if (imageData.width !== undefined) {
        setClause.push(`width = $${++paramCount}`);
        values.push(imageData.width);
      }
      if (imageData.height !== undefined) {
        setClause.push(`height = $${++paramCount}`);
        values.push(imageData.height);
      }
      if (imageData.alt_text !== undefined) {
        setClause.push(`alt_text = $${++paramCount}`);
        values.push(imageData.alt_text);
      }
      if (imageData.description !== undefined) {
        setClause.push(`description = $${++paramCount}`);
        values.push(imageData.description);
      }
      if (imageData.is_active !== undefined) {
        setClause.push(`is_active = $${++paramCount}`);
        values.push(imageData.is_active);
      }
      if (imageData.order_index !== undefined) {
        setClause.push(`order_index = $${++paramCount}`);
        values.push(imageData.order_index);
      }

      if (setClause.length === 0) {
        throw new Error('No fields to update');
      }

      setClause.push(`updated_at = NOW()`);
      values.push(id);

      const query = `
        UPDATE product_images 
        SET ${setClause.join(', ')}
        WHERE id = $${++paramCount}
        RETURNING id, product_id, filename, file_path, file_size, mime_type, width, height, 
                  alt_text, description, is_active, order_index, created_at, updated_at
      `;

      const result = await this.pool.query(query, values);
      
      if (result.rows.length === 0) {
        return null;
      }

      return new ProductImage(result.rows[0] as ProductImageData);
    } catch (error) {
      console.error('Error updating image:', error);
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
      const query = 'DELETE FROM product_images WHERE id = $1';
      const result = await this.pool.query(query, [id]);
      return result.rowCount! > 0;
    } catch (error) {
      console.error('Error deleting image:', error);
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
        SELECT id, product_id, filename, file_path, file_size, mime_type, width, height, 
               alt_text, description, is_active, order_index, created_at, updated_at
        FROM product_images 
        WHERE product_id = $1 AND is_active = true
        ORDER BY order_index ASC, created_at ASC
      `;

      const result = await this.pool.query(query, [productId]);
      return result.rows.map(row => new ProductImage(row as ProductImageData));
    } catch (error) {
      console.error('Error listing images by product:', error);
      throw error;
    }
  }

  /**
   * Delete image by product and image ID
   * @param {number} productId Product ID
   * @param {number} imageId Image ID
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  async deleteImageByProductAndId(productId: number, imageId: number): Promise<boolean> {
    try {
      const query = 'DELETE FROM product_images WHERE product_id = $1 AND id = $2';
      const result = await this.pool.query(query, [productId, imageId]);
      return result.rowCount! > 0;
    } catch (error) {
      console.error('Error deleting image by product and ID:', error);
      throw error;
    }
  }
}