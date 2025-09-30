/**
 * Category Repository
 * Database operations for categories
 *
 * Architecture : Repository pattern
 * - Data access abstraction
 * - Database operations
 * - Type safety
 */

import { Pool } from "pg";
import Category, { CategoryData } from "../models/Category";

export class CategoryRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  /**
   * Create a new category
   * @param {CategoryData} categoryData Category data
   * @returns {Promise<Category>} Created category
   */
  async createCategory(categoryData: CategoryData): Promise<Category> {
    try {
      const query = `
        INSERT INTO categories (name, description, created_at, updated_at)
        VALUES ($1, $2, NOW(), NOW())
        RETURNING id, name, description, created_at, updated_at
      `;

      const values = [categoryData.name, categoryData.description];

      const result = await this.pool.query(query, values);
      return new Category(result.rows[0] as CategoryData);
    } catch (error) {
      console.error("Error creating category:", error);
      throw error;
    }
  }

  /**
   * Get category by ID
   * @param {number} id Category ID
   * @returns {Promise<Category|null>} Category or null if not found
   */
  async getCategoryById(id: number): Promise<Category | null> {
    try {
      const query = `
        SELECT id, name, description, created_at, updated_at
        FROM categories 
        WHERE id = $1
      `;

      const result = await this.pool.query(query, [id]);

      if (result.rows.length === 0) {
        return null;
      }

      return new Category(result.rows[0] as CategoryData);
    } catch (error) {
      console.error("Error getting category by ID:", error);
      throw error;
    }
  }

  /**
   * Update category
   * @param {number} id Category ID
   * @param {Partial<CategoryData>} categoryData Category data to update
   * @returns {Promise<Category|null>} Updated category or null if not found
   */
  async updateCategory(
    id: number,
    categoryData: Partial<CategoryData>
  ): Promise<Category | null> {
    try {
      const setClause = [];
      const values = [];
      let paramCount = 0;

      if (categoryData.name !== undefined) {
        setClause.push(`name = $${++paramCount}`);
        values.push(categoryData.name);
      }
      if (categoryData.description !== undefined) {
        setClause.push(`description = $${++paramCount}`);
        values.push(categoryData.description);
      }

      if (setClause.length === 0) {
        throw new Error("No fields to update");
      }

      values.push(id);

      const query = `
        UPDATE categories 
        SET ${setClause.join(", ")}
        WHERE id = $${++paramCount}
        RETURNING id, name, description, created_at, updated_at
      `;

      const result = await this.pool.query(query, values);

      if (result.rows.length === 0) {
        return null;
      }

      return new Category(result.rows[0] as CategoryData);
    } catch (error) {
      console.error("Error updating category:", error);
      throw error;
    }
  }

  /**
   * Delete category
   * @param {number} id Category ID
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  async deleteCategory(id: number): Promise<boolean> {
    try {
      // Check if category has products
      const checkQuery =
        "SELECT COUNT(*) as count FROM products WHERE category_id = $1";
      const checkResult = await this.pool.query(checkQuery, [id]);
      const productCount = parseInt(checkResult.rows[0].count);

      if (productCount > 0) {
        throw new Error("Cannot delete category with existing products");
      }

      const query = "DELETE FROM categories WHERE id = $1";
      const result = await this.pool.query(query, [id]);
      return result.rowCount! > 0;
    } catch (error) {
      console.error("Error deleting category:", error);
      throw error;
    }
  }

  /**
   * List all categories
   * @returns {Promise<Category[]>} List of categories
   */
  async listCategories(): Promise<Category[]> {
    try {
      const query = `
        SELECT id, name, description, created_at, updated_at
        FROM categories 
        ORDER BY name ASC
      `;

      const result = await this.pool.query(query);
      return result.rows.map((row) => new Category(row as CategoryData));
    } catch (error) {
      console.error("Error listing categories:", error);
      throw error;
    }
  }

  /**
   * Check if category name exists
   * @param {string} name Category name
   * @param {number} excludeId Category ID to exclude from check
   * @returns {Promise<boolean>} True if name exists
   */
  async categoryNameExists(name: string, excludeId?: number): Promise<boolean> {
    try {
      let query = "SELECT COUNT(*) as count FROM categories WHERE name = $1";
      const values = [name];

      if (excludeId) {
        query += " AND id != $2";
        values.push(excludeId.toString());
      }

      const result = await this.pool.query(query, values);
      return parseInt(result.rows[0].count) > 0;
    } catch (error) {
      console.error("Error checking category name:", error);
      throw error;
    }
  }
}
