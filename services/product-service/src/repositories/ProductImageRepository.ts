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
      console.error("Erreur lors de la création de l'image de produit:", error);
      throw error;
    }
  }

  /**
   * Obtenir une image par ID
   * @param {number} id ID de l'image
   * @returns {Promise<ProductImage|null>} Image ou null si non trouvée
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
      console.error("Erreur lors de la récupération de l'image par ID:", error);
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
   * @returns {Promise<ProductImage[]>} Liste des images
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
