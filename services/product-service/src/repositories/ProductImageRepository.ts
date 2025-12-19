/**
 * Repository Image de Produit
 * Opérations de base de données pour les images de produit
 *
 * Architecture : Pattern Repository
 * - Abstraction d'accès aux données
 * - Opérations de base de données
 * - Sécurité des types
 */

import { Pool } from "pg";
import ProductImage, { ProductImageData } from "../models/ProductImage";

export class ProductImageRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  /**
   * Créer une nouvelle image de produit
   * @param {ProductImageData} imageData Données de l'image
   * @returns {Promise<ProductImage>} Image créée
   */
  async createImage(imageData: ProductImageData): Promise<ProductImage> {
    try {
      if (!imageData.image_data || imageData.image_data.length === 0) {
        throw new Error("image_data est requis pour créer une image");
      }

      const query = `
        INSERT INTO product_images (product_id, filename, order_index, image_data)
        VALUES ($1, $2, $3, $4)
        RETURNING id, product_id, filename, order_index, image_data
      `;

      const values = [
        imageData.product_id,
        imageData.filename,
        imageData.order_index,
        imageData.image_data,
      ];

      const result = await this.pool.query(query, values);
      const row = result.rows[0];
      return new ProductImage({
        id: row.id,
        product_id: row.product_id,
        filename: row.filename,
        order_index: row.order_index,
        image_data: row.image_data || null,
      });
    } catch (error) {
      console.error("Erreur lors de la création de l'image de produit:", error);
      throw error;
    }
  }

  /**
   * Obtenir une image par ID
   * @param {number} id ID de l'image
   * @param {boolean} includeImageData Si true, inclut les données binaires de l'image
   * @returns {Promise<ProductImage|null>} Image ou null si non trouvée
   */
  async getImageById(
    id: number,
    includeImageData: boolean = false
  ): Promise<ProductImage | null> {
    try {
      const query = `
        SELECT id, product_id, filename, order_index, image_data
        FROM product_images 
        WHERE id = $1
      `;

      const result = await this.pool.query(query, [id]);

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return new ProductImage({
        id: row.id,
        product_id: row.product_id,
        filename: row.filename,
        order_index: row.order_index,
        image_data: includeImageData ? row.image_data || null : null,
      });
    } catch (error) {
      console.error("Erreur lors de la récupération de l'image par ID:", error);
      throw error;
    }
  }

  /**
   * Mettre à jour une image
   * @param {number} id ID de l'image
   * @param {Partial<ProductImageData>} imageData Données de l'image à mettre à jour
   * @returns {Promise<ProductImage|null>} Image mise à jour ou null si non trouvée
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
      if (imageData.order_index !== undefined) {
        setClause.push(`order_index = $${++paramCount}`);
        values.push(imageData.order_index);
      }
      if (imageData.image_data !== undefined) {
        setClause.push(`image_data = $${++paramCount}`);
        values.push(imageData.image_data);
      }

      if (setClause.length === 0) {
        throw new Error("Aucun champ à mettre à jour");
      }

      values.push(id);

      const query = `
        UPDATE product_images 
        SET ${setClause.join(", ")}
        WHERE id = $${++paramCount}
        RETURNING id, product_id, filename, order_index, image_data
      `;

      const result = await this.pool.query(query, values);

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return new ProductImage({
        id: row.id,
        product_id: row.product_id,
        filename: row.filename,
        order_index: row.order_index,
        image_data: row.image_data || null,
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'image:", error);
      throw error;
    }
  }

  /**
   * Supprimer une image
   * @param {number} id ID de l'image
   * @returns {Promise<boolean>} True si supprimée, false si non trouvée
   */
  async deleteImage(id: number): Promise<boolean> {
    try {
      const query = "DELETE FROM product_images WHERE id = $1";
      const result = await this.pool.query(query, [id]);
      return result.rowCount! > 0;
    } catch (error) {
      console.error("Erreur lors de la suppression de l'image:", error);
      throw error;
    }
  }

  /**
   * Lister les images d'un produit
   * @param {number} productId ID du produit
   * @param {boolean} includeImageData Si true, inclut les données binaires (non recommandé pour les listes)
   * @returns {Promise<ProductImage[]>} Liste des images
   */
  async listImagesByProduct(
    productId: number,
    includeImageData: boolean = false
  ): Promise<ProductImage[]> {
    try {
      const query = `
        SELECT id, product_id, filename, order_index, image_data
        FROM product_images 
        WHERE product_id = $1
        ORDER BY order_index ASC
      `;

      const result = await this.pool.query(query, [productId]);
      return result.rows.map(
        (row) =>
          new ProductImage({
            id: row.id,
            product_id: row.product_id,
            filename: row.filename,
            order_index: row.order_index,
            image_data: includeImageData ? row.image_data || null : null,
          })
      );
    } catch (error) {
      console.error("Erreur lors de la liste des images par produit:", error);
      throw error;
    }
  }

  /**
   * Supprimer une image par produit et ID d'image
   * @param {number} productId ID du produit
   * @param {number} imageId ID de l'image
   * @returns {Promise<boolean>} True si supprimée, false si non trouvée
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
      console.error(
        "Erreur lors de la suppression de l'image par produit et ID:",
        error
      );
      throw error;
    }
  }
}
