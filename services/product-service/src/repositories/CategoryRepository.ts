/**
 * Repository Catégorie
 * Opérations de base de données pour les catégories
 *
 * Architecture : Pattern Repository
 * - Abstraction d'accès aux données
 * - Opérations de base de données
 * - Sécurité des types
 */

import { Pool } from "pg";
import Category, { CategoryData } from "../models/Category";

export class CategoryRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  /**
   * Créer une nouvelle catégorie
   * @param {CategoryData} categoryData Données de la catégorie
   * @returns {Promise<Category>} Catégorie créée
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
      console.error("Erreur lors de la création de la catégorie:", error);
      throw error;
    }
  }

  /**
   * Obtenir une catégorie par ID
   * @param {number} id ID de la catégorie
   * @returns {Promise<Category|null>} Catégorie ou null si non trouvée
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
      console.error(
        "Erreur lors de la récupération de la catégorie par ID:",
        error
      );
      throw error;
    }
  }

  /**
   * Mettre à jour une catégorie
   * @param {number} id ID de la catégorie
   * @param {Partial<CategoryData>} categoryData Données de la catégorie à mettre à jour
   * @returns {Promise<Category|null>} Catégorie mise à jour ou null si non trouvée
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
        throw new Error("Aucun champ à mettre à jour");
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
      console.error("Erreur lors de la mise à jour de la catégorie:", error);
      throw error;
    }
  }

  /**
   * Supprimer une catégorie
   * @param {number} id ID de la catégorie
   * @returns {Promise<boolean>} True si supprimée, false si non trouvée
   */
  async deleteCategory(id: number): Promise<boolean> {
    try {
      // Vérifier si la catégorie a des produits
      const checkQuery =
        "SELECT COUNT(*) as count FROM products WHERE category_id = $1";
      const checkResult = await this.pool.query(checkQuery, [id]);
      const productCount = parseInt(checkResult.rows[0].count);

      if (productCount > 0) {
        throw new Error(
          "Impossible de supprimer cette catégorie car elle contient des produits"
        );
      }

      const query = "DELETE FROM categories WHERE id = $1";
      const result = await this.pool.query(query, [id]);
      return result.rowCount! > 0;
    } catch (error) {
      console.error("Erreur lors de la suppression de la catégorie:", error);
      throw error;
    }
  }

  /**
   * Lister toutes les catégories
   * @returns {Promise<Category[]>} Liste des catégories
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
      console.error("Erreur lors de la liste des catégories:", error);
      throw error;
    }
  }

  /**
   * Lister les catégories avec pagination et recherche (CategorySearchDTO)
   * @param {Object} options Options de recherche
   * @returns {Promise<Object>} Catégories avec informations de pagination
   */
  async listCategoriesWithSearch(options: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: "name" | "createdAt";
    sortOrder?: "asc" | "desc";
  }): Promise<{
    categories: Category[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    try {
      const page = options.page || 1;
      const limit = options.limit || 10;
      const offset = (page - 1) * limit;

      const whereConditions = [];
      const values = [];
      let paramCount = 0;

      if (options.search) {
        whereConditions.push(
          `(name ILIKE $${++paramCount} OR description ILIKE $${++paramCount})`
        );
        const searchTerm = `%${options.search}%`;
        values.push(searchTerm, searchTerm);
      }

      const whereClause =
        whereConditions.length > 0
          ? `WHERE ${whereConditions.join(" AND ")}`
          : "";

      // Compter le total des catégories
      const countQuery = `
        SELECT COUNT(*) as total
        FROM categories
        ${whereClause}
      `;
      const countResult = await this.pool.query(countQuery, values);
      const total = parseInt(countResult.rows[0].total);

      // Mapper les noms de colonnes camelCase vers snake_case
      const sortByMapping: Record<string, string> = {
        name: "name",
        createdAt: "created_at",
        created_at: "created_at",
      };

      const sortByParam = options.sortBy || "name";
      const sortBy = sortByMapping[sortByParam] || sortByParam;
      const sortOrder = options.sortOrder || "asc";

      // Valider que la colonne existe pour éviter les injections SQL
      const allowedColumns = ["name", "created_at", "updated_at"];
      const safeSortBy = allowedColumns.includes(sortBy) ? sortBy : "name";
      const orderClause = `ORDER BY ${safeSortBy} ${sortOrder.toUpperCase()}`;

      // Obtenir les catégories
      const query = `
        SELECT id, name, description, created_at, updated_at
        FROM categories
        ${whereClause}
        ${orderClause}
        LIMIT $${++paramCount} OFFSET $${++paramCount}
      `;

      values.push(limit, offset);
      const result = await this.pool.query(query, values);

      const categories = result.rows.map(
        (row) => new Category(row as CategoryData)
      );

      return {
        categories,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error(
        "Erreur lors de la liste des catégories avec recherche:",
        error
      );
      throw error;
    }
  }

  /**
   * Vérifier si le nom de catégorie existe
   * @param {string} name Nom de la catégorie
   * @param {number} excludeId ID de catégorie à exclure de la vérification
   * @returns {Promise<boolean>} True si le nom existe
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
      console.error(
        "Erreur lors de la vérification du nom de catégorie:",
        error
      );
      throw error;
    }
  }
}
