/**
 * ProductRepository
 * Handles database operations for Product entities
 */
const Product = require("../models/Product");

class ProductRepository {
  constructor(pool) {
    this.pool = pool;
  }

  /**
   * Get product by ID
   * @param {number} id Product ID
   * @returns {Promise<Product|null>} Product or null if not found
   */
  async getById(id) {
    try {
      const result = await this.pool.query(
        `SELECT id, name, description, price, vat_rate, category_id, is_active, 
                created_at, updated_at
         FROM products 
         WHERE id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return Product.fromDbRow(result.rows[0]);
    } catch (error) {
      console.error("Error getting product by ID:", error);
      throw new Error("Failed to retrieve product");
    }
  }

  /**
   * Get product by ID with joins
   * @param {number} id Product ID
   * @returns {Promise<Product|null>} Product with joined data or null if not found
   */
  async getByIdWithJoins(id) {
    try {
      const result = await this.pool.query(
        `SELECT p.id, p.name, p.description, p.price, p.vat_rate, p.category_id, 
                p.is_active, p.created_at, p.updated_at,
                c.name as category_name
         FROM products p
         LEFT JOIN categories c ON p.category_id = c.id
         WHERE p.id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return Product.fromDbRowWithJoins(result.rows[0]);
    } catch (error) {
      console.error("Error getting product by ID with joins:", error);
      throw new Error("Failed to retrieve product");
    }
  }

  /**
   * List all active products
   * @returns {Promise<Product[]>} Array of active products
   */
  async listAllActive() {
    try {
      const result = await this.pool.query(
        `SELECT p.id, p.name, p.description, p.price, p.vat_rate, p.category_id, 
                p.is_active, p.created_at, p.updated_at,
                c.name as category_name
         FROM products p
         LEFT JOIN categories c ON p.category_id = c.id
         WHERE p.is_active = true
         ORDER BY p.created_at DESC`
      );

      return result.rows.map((row) => Product.fromDbRowWithJoins(row));
    } catch (error) {
      console.error("Error listing active products:", error);
      throw new Error("Failed to retrieve products");
    }
  }

  /**
   * List products by category
   * @param {number} categoryId Category ID
   * @returns {Promise<Product[]>} Array of products in category
   */
  async listByCategory(categoryId) {
    try {
      const result = await this.pool.query(
        `SELECT p.id, p.name, p.description, p.price, p.vat_rate, p.category_id, 
                p.is_active, p.created_at, p.updated_at,
                c.name as category_name
         FROM products p
         LEFT JOIN categories c ON p.category_id = c.id
         WHERE p.category_id = $1 AND p.is_active = true
         ORDER BY p.created_at DESC`,
        [categoryId]
      );

      return result.rows.map((row) => Product.fromDbRowWithJoins(row));
    } catch (error) {
      console.error("Error listing products by category:", error);
      throw new Error("Failed to retrieve products");
    }
  }

  /**
   * List products with pagination and search
   * @param {Object} options Pagination and search options
   * @returns {Promise<Object>} Products and pagination info
   */
  async listAll(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        search = "",
        categoryId,
        activeOnly = true,
      } = options;
      const offset = (page - 1) * limit;

      let query = `
        SELECT p.id, p.name, p.description, p.price, p.vat_rate, p.category_id, 
               p.is_active, p.created_at, p.updated_at,
               c.name as category_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
      `;

      const params = [];
      let paramCount = 0;
      const conditions = [];

      if (activeOnly) {
        conditions.push(`p.is_active = true`);
      }

      if (categoryId) {
        conditions.push(`p.category_id = $${++paramCount}`);
        params.push(categoryId);
      }

      if (search) {
        conditions.push(
          `(p.name ILIKE $${++paramCount} OR p.description ILIKE $${paramCount})`
        );
        params.push(`%${search}%`);
      }

      if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(" AND ")}`;
      }

      query += ` ORDER BY p.created_at DESC LIMIT $${++paramCount} OFFSET $${++paramCount}`;
      params.push(limit, offset);

      const result = await this.pool.query(query, params);

      // Get total count
      let countQuery = `
        SELECT COUNT(*) 
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
      `;

      if (conditions.length > 0) {
        countQuery += ` WHERE ${conditions.join(" AND ")}`;
      }

      const countResult = await this.pool.query(
        countQuery,
        params.slice(0, -2)
      );

      return {
        products: result.rows.map((row) => Product.fromDbRowWithJoins(row)),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: parseInt(countResult.rows[0].count),
          pages: Math.ceil(countResult.rows[0].count / limit),
        },
      };
    } catch (error) {
      console.error("Error listing products:", error);
      throw new Error("Failed to list products");
    }
  }

  /**
   * Save new product
   * @param {Product} product Product entity to save
   * @returns {Promise<Product>} Saved product with ID
   */
  async save(product) {
    try {
      const validation = product.validate();
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
      }

      const result = await this.pool.query(
        `INSERT INTO products (name, description, price, vat_rate, category_id, 
                              is_active, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
         RETURNING id, name, description, price, vat_rate, category_id, 
                   is_active, created_at, updated_at`,
        [
          product.name,
          product.description,
          product.price,
          product.vatRate,
          product.categoryId,
          product.isActive,
        ]
      );

      return Product.fromDbRow(result.rows[0]);
    } catch (error) {
      console.error("Error saving product:", error);
      throw new Error("Failed to save product");
    }
  }

  /**
   * Update existing product
   * @param {Product} product Product entity to update
   * @returns {Promise<Product>} Updated product
   */
  async update(product) {
    try {
      const validation = product.validate();
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
      }

      const result = await this.pool.query(
        `UPDATE products 
         SET name = $1, description = $2, price = $3, vat_rate = $4, 
             category_id = $5, is_active = $6, updated_at = NOW()
         WHERE id = $7
         RETURNING id, name, description, price, vat_rate, category_id, 
                   is_active, created_at, updated_at`,
        [
          product.name,
          product.description,
          product.price,
          product.vatRate,
          product.categoryId,
          product.isActive,
          product.id,
        ]
      );

      if (result.rows.length === 0) {
        throw new Error("Product not found");
      }

      return Product.fromDbRow(result.rows[0]);
    } catch (error) {
      console.error("Error updating product:", error);
      throw new Error("Failed to update product");
    }
  }

  /**
   * Delete product
   * @param {Product} product Product entity to delete
   * @returns {Promise<boolean>} True if deleted successfully
   */
  async delete(product) {
    try {
      const result = await this.pool.query(
        "DELETE FROM products WHERE id = $1 RETURNING id",
        [product.id]
      );

      return result.rows.length > 0;
    } catch (error) {
      console.error("Error deleting product:", error);
      throw new Error("Failed to delete product");
    }
  }

  /**
   * Activate product
   * @param {number} id Product ID
   * @returns {Promise<boolean>} True if activated successfully
   */
  async activate(id) {
    try {
      const result = await this.pool.query(
        "UPDATE products SET is_active = true, updated_at = NOW() WHERE id = $1 RETURNING id",
        [id]
      );

      return result.rows.length > 0;
    } catch (error) {
      console.error("Error activating product:", error);
      throw new Error("Failed to activate product");
    }
  }

  /**
   * Deactivate product
   * @param {number} id Product ID
   * @returns {Promise<boolean>} True if deactivated successfully
   */
  async deactivate(id) {
    try {
      const result = await this.pool.query(
        "UPDATE products SET is_active = false, updated_at = NOW() WHERE id = $1 RETURNING id",
        [id]
      );

      return result.rows.length > 0;
    } catch (error) {
      console.error("Error deactivating product:", error);
      throw new Error("Failed to deactivate product");
    }
  }

  /**
   * Check if product name exists
   * @param {string} name Product name to check
   * @param {number|null} excludeId Product ID to exclude from check (for updates)
   * @returns {Promise<boolean>} True if name exists
   */
  async nameExists(name, excludeId = null) {
    try {
      let query = "SELECT id FROM products WHERE name = $1";
      const params = [name];

      if (excludeId) {
        query += " AND id != $2";
        params.push(excludeId);
      }

      const result = await this.pool.query(query, params);
      return result.rows.length > 0;
    } catch (error) {
      console.error("Error checking product name existence:", error);
      throw new Error("Failed to check product name existence");
    }
  }
}

module.exports = ProductRepository;
