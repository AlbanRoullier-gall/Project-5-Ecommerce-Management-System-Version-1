/**
 * CategoryRepository
 * Handles database operations for Category entities
 */
import { Pool } from "pg";
import Category from "../models/Category";

export default class CategoryRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  /**
   * Get category by ID
   * @param {number} id Category ID
   * @returns {Promise<Category|null>} Category or null if not found
   */
  async getById(id: number): Promise<Category | null> {
    try {
      const result = await this.pool.query(
        `SELECT id, name, description, created_at, updated_at
         FROM categories 
         WHERE id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return Category.fromDbRow(result.rows[0]);
    } catch (error) {
      console.error("Error getting category by ID:", error);
      throw new Error("Failed to retrieve category");
    }
  }

  /**
   * List all categories
   * @returns {Promise<Category[]>} Array of categories
   */
  async listAll(): Promise<Category[]> {
    try {
      const result = await this.pool.query(
        `SELECT id, name, description, created_at, updated_at
         FROM categories 
         ORDER BY name`
      );

      return result.rows.map((row) => Category.fromDbRow(row));
    } catch (error) {
      console.error("Error listing categories:", error);
      throw new Error("Failed to retrieve categories");
    }
  }

  /**
   * Save new category
   * @param {Category} category Category entity to save
   * @returns {Promise<Category>} Saved category with ID
   */
  async save(category: Category): Promise<Category> {
    try {
      const validation = category.validate();
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
      }

      const result = await this.pool.query(
        `INSERT INTO categories (name, description, created_at, updated_at)
         VALUES ($1, $2, NOW(), NOW())
         RETURNING id, name, description, created_at, updated_at`,
        [category.name, category.description]
      );

      return Category.fromDbRow(result.rows[0]);
    } catch (error) {
      console.error("Error saving category:", error);
      throw new Error("Failed to save category");
    }
  }

  /**
   * Update existing category
   * @param {Category} category Category entity to update
   * @returns {Promise<Category>} Updated category
   */
  async update(category: Category): Promise<Category> {
    try {
      const validation = category.validate();
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
      }

      const result = await this.pool.query(
        `UPDATE categories 
         SET name = $1, description = $2, updated_at = NOW()
         WHERE id = $3
         RETURNING id, name, description, created_at, updated_at`,
        [category.name, category.description, category.id]
      );

      if (result.rows.length === 0) {
        throw new Error("Category not found");
      }

      return Category.fromDbRow(result.rows[0]);
    } catch (error) {
      console.error("Error updating category:", error);
      throw new Error("Failed to update category");
    }
  }

  /**
   * Delete category
   * @param {Category} category Category entity to delete
   * @returns {Promise<boolean>} True if deleted successfully
   */
  async delete(category: Category): Promise<boolean> {
    try {
      const result = await this.pool.query(
        "DELETE FROM categories WHERE id = $1 RETURNING id",
        [category.id]
      );

      return result.rows.length > 0;
    } catch (error) {
      console.error("Error deleting category:", error);
      throw new Error("Failed to delete category");
    }
  }

  /**
   * Check if category name exists
   * @param {string} name Category name to check
   * @param {number|null} excludeId Category ID to exclude from check (for updates)
   * @returns {Promise<boolean>} True if name exists
   */
  async nameExists(
    name: string,
    excludeId: number | null = null
  ): Promise<boolean> {
    try {
      let query = "SELECT id FROM categories WHERE name = $1";
      const params: any[] = [name];

      if (excludeId) {
        query += " AND id != $2";
        params.push(excludeId);
      }

      const result = await this.pool.query(query, params);
      return result.rows.length > 0;
    } catch (error) {
      console.error("Error checking category name existence:", error);
      throw new Error("Failed to check category name existence");
    }
  }

  /**
   * Count products in category
   * @param {number} categoryId Category ID
   * @returns {Promise<number>} Number of products in category
   */
  async countProducts(categoryId: number): Promise<number> {
    try {
      const result = await this.pool.query(
        "SELECT COUNT(*) FROM products WHERE category_id = $1",
        [categoryId]
      );

      return parseInt(result.rows[0].count);
    } catch (error) {
      console.error("Error counting products in category:", error);
      throw new Error("Failed to count products in category");
    }
  }

  /**
   * Search categories by name
   * @param {string} searchTerm Search term
   * @param {Object} options Search options
   * @returns {Promise<Object>} Categories and pagination info
   */
  async searchByName(
    searchTerm: string,
    options: { page?: number; limit?: number } = {}
  ): Promise<{
    categories: Category[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    try {
      const { page = 1, limit = 10 } = options;
      const offset = (page - 1) * limit;

      const result = await this.pool.query(
        `SELECT id, name, description, created_at, updated_at
         FROM categories 
         WHERE name ILIKE $1
         ORDER BY name
         LIMIT $2 OFFSET $3`,
        [`%${searchTerm}%`, limit, offset]
      );

      // Get total count
      const countResult = await this.pool.query(
        "SELECT COUNT(*) FROM categories WHERE name ILIKE $1",
        [`%${searchTerm}%`]
      );

      return {
        categories: result.rows.map((row) => Category.fromDbRow(row)),
        pagination: {
          page: parseInt(page.toString()),
          limit: parseInt(limit.toString()),
          total: parseInt(countResult.rows[0].count),
          pages: Math.ceil(parseInt(countResult.rows[0].count) / limit),
        },
      };
    } catch (error) {
      console.error("Error searching categories:", error);
      throw new Error("Failed to search categories");
    }
  }

  /**
   * Find category by ID (alias for getById)
   * @param {number} id Category ID
   * @returns {Promise<Category|null>} Category or null if not found
   */
  async findById(id: number): Promise<Category | null> {
    return this.getById(id);
  }
}
