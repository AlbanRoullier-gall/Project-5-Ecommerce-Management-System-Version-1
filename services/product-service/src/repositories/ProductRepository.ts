/**
 * Repository Produit
 * Opérations de base de données pour les produits
 *
 * Architecture : Pattern Repository
 * - Abstraction d'accès aux données
 * - Opérations de base de données
 * - Sécurité des types
 */

import { Pool } from "pg";
import Product, { ProductData } from "../models/Product";

export class ProductRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  /**
   * Créer un nouveau produit
   * @param {ProductData} productData Données du produit
   * @returns {Promise<Product>} Produit créé
   */
  async createProduct(productData: ProductData): Promise<Product> {
    try {
      const query = `
        INSERT INTO products (name, description, price, vat_rate, category_id, is_active, stock, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
        RETURNING id, name, description, price, vat_rate, category_id, is_active, stock, created_at, updated_at
      `;

      const values = [
        productData.name,
        productData.description,
        productData.price,
        productData.vat_rate,
        productData.category_id,
        productData.is_active,
        productData.stock ?? 0,
      ];

      const result = await this.pool.query(query, values);
      return new Product(result.rows[0] as ProductData);
    } catch (error) {
      console.error("Erreur lors de la création du produit:", error);
      throw error;
    }
  }

  /**
   * Obtenir un produit par ID
   * @param {number} id ID du produit
   * @returns {Promise<Product|null>} Produit ou null si non trouvé
   */
  async getProductById(id: number): Promise<Product | null> {
    try {
      const query = `
        SELECT id, name, description, price, vat_rate, category_id, is_active, stock, created_at, updated_at
        FROM products 
        WHERE id = $1
      `;

      const result = await this.pool.query(query, [id]);

      if (result.rows.length === 0) {
        return null;
      }

      return new Product(result.rows[0] as ProductData);
    } catch (error) {
      console.error("Erreur lors de la récupération du produit par ID:", error);
      throw error;
    }
  }

  /**
   * Obtenir un produit par ID avec informations de catégorie
   * @param {number} id ID du produit
   * @returns {Promise<Product|null>} Produit avec catégorie ou null si non trouvé
   */
  async getProductByIdWithCategory(id: number): Promise<Product | null> {
    try {
      const query = `
        SELECT p.id, p.name, p.description, p.price, p.vat_rate, p.category_id, p.is_active, 
               p.stock, p.created_at, p.updated_at, c.name as category_name
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
      console.error(
        "Erreur lors de la récupération du produit avec catégorie:",
        error
      );
      throw error;
    }
  }

  /**
   * Mettre à jour un produit
   * @param {number} id ID du produit
   * @param {Partial<ProductData>} productData Données du produit à mettre à jour
   * @returns {Promise<Product|null>} Produit mis à jour ou null si non trouvé
   */
  async updateProduct(
    id: number,
    productData: Partial<ProductData>
  ): Promise<Product | null> {
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
      if (productData.stock !== undefined) {
        setClause.push(`stock = $${++paramCount}`);
        values.push(productData.stock);
      }

      if (setClause.length === 0) {
        throw new Error("Aucun champ à mettre à jour");
      }

      values.push(id);

      const query = `
        UPDATE products 
        SET ${setClause.join(", ")}
        WHERE id = $${++paramCount}
        RETURNING id, name, description, price, vat_rate, category_id, is_active, stock, created_at, updated_at
      `;

      const result = await this.pool.query(query, values);

      if (result.rows.length === 0) {
        return null;
      }

      return new Product(result.rows[0] as ProductData);
    } catch (error) {
      console.error("Erreur lors de la mise à jour du produit:", error);
      throw error;
    }
  }

  /**
   * Supprimer un produit
   * @param {number} id ID du produit
   * @returns {Promise<boolean>} True si supprimé, false si non trouvé
   */
  async deleteProduct(id: number): Promise<boolean> {
    try {
      const query = "DELETE FROM products WHERE id = $1";
      const result = await this.pool.query(query, [id]);
      return result.rowCount! > 0;
    } catch (error) {
      console.error("Erreur lors de la suppression du produit:", error);
      throw error;
    }
  }

  /**
   * Lister les produits avec filtrage
   * @param {Object} options Options de liste
   * @returns {Promise<Product[]>} Liste des produits
   */
  async listProducts(options: {
    categoryId?: number;
    categories?: number[]; // Support pour multi-catégories (ProductFilterDTO)
    search?: string;
    activeOnly?: boolean;
    minPrice?: number; // Support pour plage de prix (ProductFilterDTO)
    maxPrice?: number; // Support pour plage de prix (ProductFilterDTO)
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }): Promise<Product[]> {
    try {
      const whereConditions = [];
      const values = [];
      let paramCount = 0;

      // Support pour une seule catégorie (rétrocompatibilité)
      if (options.categoryId) {
        whereConditions.push(`p.category_id = $${++paramCount}`);
        values.push(options.categoryId);
      }

      // Support pour plusieurs catégories (ProductFilterDTO)
      if (options.categories && options.categories.length > 0) {
        whereConditions.push(`p.category_id = ANY($${++paramCount})`);
        values.push(options.categories);
      }

      if (options.search) {
        whereConditions.push(
          `(p.name ILIKE $${++paramCount} OR p.description ILIKE $${++paramCount})`
        );
        const searchTerm = `%${options.search}%`;
        values.push(searchTerm, searchTerm);
      }

      // Filtrer par statut actif/inactif si activeOnly est défini (true ou false)
      if (options.activeOnly !== undefined) {
        whereConditions.push(`p.is_active = $${++paramCount}`);
        values.push(options.activeOnly);
      }

      // Support pour plage de prix (ProductFilterDTO)
      if (options.minPrice !== undefined) {
        whereConditions.push(`p.price >= $${++paramCount}`);
        values.push(options.minPrice);
      }

      if (options.maxPrice !== undefined) {
        whereConditions.push(`p.price <= $${++paramCount}`);
        values.push(options.maxPrice);
      }

      const whereClause =
        whereConditions.length > 0
          ? `WHERE ${whereConditions.join(" AND ")}`
          : "";

      // Mapper les noms de colonnes camelCase vers snake_case pour la base de données
      const sortByMapping: Record<string, string> = {
        name: "name",
        price: "price",
        createdAt: "created_at",
        created_at: "created_at",
      };

      const sortByParam = options.sortBy || "created_at";
      const sortBy = sortByMapping[sortByParam] || sortByParam;
      const sortOrder = options.sortOrder || "desc";

      // Valider que la colonne existe pour éviter les injections SQL
      const allowedColumns = ["name", "price", "created_at", "updated_at"];
      const safeSortBy = allowedColumns.includes(sortBy)
        ? sortBy
        : "created_at";
      const orderClause = `ORDER BY p.${safeSortBy} ${sortOrder.toUpperCase()}`;

      const query = `
        SELECT p.id, p.name, p.description, p.price, p.vat_rate, p.category_id, p.is_active, 
               p.stock, p.created_at, p.updated_at, c.name as category_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        ${whereClause}
        ${orderClause}
      `;

      const result = await this.pool.query(query, values);

      const products = result.rows.map((row) => {
        const product = new Product(row as ProductData);
        (product as any).categoryName = row.category_name;
        return product;
      });

      return products;
    } catch (error) {
      console.error("Erreur lors de la liste des produits:", error);
      throw error;
    }
  }
}
