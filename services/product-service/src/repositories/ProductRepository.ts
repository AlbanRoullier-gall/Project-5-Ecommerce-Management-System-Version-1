/**
 * Product Repository
 * Database operations for products
 *
 * Architecture : Repository pattern
 * - Data access abstraction
 * - Database operations
 * - Type safety
 */

import { Pool } from 'pg';
import Product, { ProductData } from '../models/Product';

export class ProductRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  /**
   * Create a new product
   * @param {ProductData} productData Product data
   * @returns {Promise<Product>} Created product
   */
  async createProduct(productData: ProductData): Promise<Product> {
    try {
      const query = `
        INSERT INTO products (name, description, price, vat_rate, category_id, is_active, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
        RETURNING id, name, description, price, vat_rate, category_id, is_active, created_at, updated_at
      `;

      const values = [
        productData.name,
        productData.description,
        productData.price,
        productData.vat_rate,
        productData.category_id,
        productData.is_active,
      ];

      const result = await this.pool.query(query, values);
      return new Product(result.rows[0] as ProductData);
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  /**
   * Get product by ID
   * @param {number} id Product ID
   * @returns {Promise<Product|null>} Product or null if not found
   */
  async getProductById(id: number): Promise<Product | null> {
    try {
      const query = `
        SELECT id, name, description, price, vat_rate, category_id, is_active, created_at, updated_at
        FROM products 
        WHERE id = $1
      `;

      const result = await this.pool.query(query, [id]);
      
      if (result.rows.length === 0) {
        return null;
      }

      return new Product(result.rows[0] as ProductData);
    } catch (error) {
      console.error('Error getting product by ID:', error);
      throw error;
    }
  }

  /**
   * Get product by ID with category information
   * @param {number} id Product ID
   * @returns {Promise<Product|null>} Product with category or null if not found
   */
  async getProductByIdWithCategory(id: number): Promise<Product | null> {
    try {
      const query = `
        SELECT p.id, p.name, p.description, p.price, p.vat_rate, p.category_id, p.is_active, 
               p.created_at, p.updated_at, c.name as category_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.id = $1
      `;

      const result = await this.pool.query(query, [id]);
      
      if (result.rows.length === 0) {
        return null;
      }

      const product = new Product(result.rows[0] as ProductData);
      (product as any).categoryName = result.rows[0].category_name;
      return product;
    } catch (error) {
      console.error('Error getting product with category:', error);
      throw error;
    }
  }

  /**
   * Update product
   * @param {number} id Product ID
   * @param {Partial<ProductData>} productData Product data to update
   * @returns {Promise<Product|null>} Updated product or null if not found
   */
  async updateProduct(id: number, productData: Partial<ProductData>): Promise<Product | null> {
    try {
      const setClause = [];
      const values = [];
      let paramCount = 0;

      if (productData.name !== undefined) {
        setClause.push(`name = $${++paramCount}`);
        values.push(productData.name);
      }
      if (productData.description !== undefined) {
        setClause.push(`description = $${++paramCount}`);
        values.push(productData.description);
      }
      if (productData.price !== undefined) {
        setClause.push(`price = $${++paramCount}`);
        values.push(productData.price);
      }
      if (productData.vat_rate !== undefined) {
        setClause.push(`vat_rate = $${++paramCount}`);
        values.push(productData.vat_rate);
      }
      if (productData.category_id !== undefined) {
        setClause.push(`category_id = $${++paramCount}`);
        values.push(productData.category_id);
      }
      if (productData.is_active !== undefined) {
        setClause.push(`is_active = $${++paramCount}`);
        values.push(productData.is_active);
      }

      if (setClause.length === 0) {
        throw new Error('No fields to update');
      }

      setClause.push(`updated_at = NOW()`);
      values.push(id);

      const query = `
        UPDATE products 
        SET ${setClause.join(', ')}
        WHERE id = $${++paramCount}
        RETURNING id, name, description, price, vat_rate, category_id, is_active, created_at, updated_at
      `;

      const result = await this.pool.query(query, values);
      
      if (result.rows.length === 0) {
        return null;
      }

      return new Product(result.rows[0] as ProductData);
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  /**
   * Delete product
   * @param {number} id Product ID
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  async deleteProduct(id: number): Promise<boolean> {
    try {
      const query = 'DELETE FROM products WHERE id = $1';
      const result = await this.pool.query(query, [id]);
      return result.rowCount! > 0;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }

  /**
   * List products with pagination and filtering
   * @param {Object} options List options
   * @returns {Promise<Object>} Products with pagination info
   */
  async listProducts(options: {
    page: number;
    limit: number;
    categoryId?: number;
    search?: string;
    activeOnly?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{
    products: Product[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    try {
      const offset = (options.page - 1) * options.limit;
      const whereConditions = [];
      const values = [];
      let paramCount = 0;

      if (options.categoryId) {
        whereConditions.push(`p.category_id = $${++paramCount}`);
        values.push(options.categoryId);
      }

      if (options.search) {
        whereConditions.push(`(p.name ILIKE $${++paramCount} OR p.description ILIKE $${++paramCount})`);
        const searchTerm = `%${options.search}%`;
        values.push(searchTerm, searchTerm);
      }

      if (options.activeOnly) {
        whereConditions.push(`p.is_active = $${++paramCount}`);
        values.push(true);
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      // Count total products
      const countQuery = `
        SELECT COUNT(*) as total
        FROM products p
        ${whereClause}
      `;
      const countResult = await this.pool.query(countQuery, values);
      const total = parseInt(countResult.rows[0].total);

      // Get products
      const sortBy = options.sortBy || 'created_at';
      const sortOrder = options.sortOrder || 'desc';
      const orderClause = `ORDER BY p.${sortBy} ${sortOrder.toUpperCase()}`;

      const query = `
        SELECT p.id, p.name, p.description, p.price, p.vat_rate, p.category_id, p.is_active, 
               p.created_at, p.updated_at, c.name as category_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        ${whereClause}
        ${orderClause}
        LIMIT $${++paramCount} OFFSET $${++paramCount}
      `;

      values.push(options.limit, offset);
      const result = await this.pool.query(query, values);

      const products = result.rows.map(row => {
        const product = new Product(row as ProductData);
        (product as any).categoryName = row.category_name;
        return product;
      });

      return {
        products,
        pagination: {
          page: options.page,
          limit: options.limit,
          total,
          pages: Math.ceil(total / options.limit),
        },
      };
    } catch (error) {
      console.error('Error listing products:', error);
      throw error;
    }
  }

  /**
   * Toggle product status
   * @param {number} id Product ID
   * @returns {Promise<Product|null>} Updated product or null if not found
   */
  async toggleProductStatus(id: number): Promise<Product | null> {
    try {
      const query = `
        UPDATE products 
        SET is_active = NOT is_active, updated_at = NOW()
        WHERE id = $1
        RETURNING id, name, description, price, vat_rate, category_id, is_active, created_at, updated_at
      `;

      const result = await this.pool.query(query, [id]);
      
      if (result.rows.length === 0) {
        return null;
      }

      return new Product(result.rows[0] as ProductData);
    } catch (error) {
      console.error('Error toggling product status:', error);
      throw error;
    }
  }
}