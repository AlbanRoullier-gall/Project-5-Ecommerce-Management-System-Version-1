/**
 * OrderItemRepository
 * Gestion des opérations de base de données pour les articles de commande
 *
 * Architecture : Repository pattern
 * - Abstraction de la couche de données
 * - Opérations CRUD pour les articles de commande
 * - Gestion des transactions
 */
import { Pool } from "pg";
import OrderItem, { OrderItemData } from "../models/OrderItem";

export default class OrderItemRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  /**
   * Récupérer un article par ID
   * @param {number} id ID de l'article
   * @returns {Promise<OrderItem | null>} Article trouvé ou null
   */
  async getOrderItemById(id: number): Promise<OrderItem | null> {
    try {
      const query = `
        SELECT id, order_id, product_id, quantity, 
               unit_price_ht, unit_price_ttc, vat_rate, total_price_ht, total_price_ttc, 
               created_at, updated_at
        FROM order_items 
        WHERE id = $1
      `;

      const result = await this.pool.query(query, [id]);

      if (result.rows.length === 0) {
        return null;
      }

      return new OrderItem(result.rows[0] as OrderItemData);
    } catch (error) {
      console.error("Error getting order item by ID:", error);
      throw new Error("Failed to retrieve order item");
    }
  }

  /**
   * Récupérer les articles d'une commande
   * @param {number} orderId ID de la commande
   * @returns {Promise<OrderItem[]>} Liste des articles
   */
  async getOrderItemsByOrderId(orderId: number): Promise<OrderItem[]> {
    try {
      const query = `
        SELECT id, order_id, product_id, product_name, quantity, 
               unit_price_ht, unit_price_ttc, vat_rate, total_price_ht, total_price_ttc, 
               created_at, updated_at
        FROM order_items 
        WHERE order_id = $1
        ORDER BY created_at
      `;

      const result = await this.pool.query(query, [orderId]);
      return result.rows.map((row) => new OrderItem(row as OrderItemData));
    } catch (error) {
      console.error("Error getting order items by order ID:", error);
      throw new Error("Failed to retrieve order items");
    }
  }

  /**
   * Supprimer un article
   * @param {number} id ID de l'article
   * @returns {Promise<boolean>} True si supprimé, false sinon
   */
  async deleteOrderItem(id: number): Promise<boolean> {
    try {
      const query = "DELETE FROM order_items WHERE id = $1";
      const result = await this.pool.query(query, [id]);
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      console.error("Error deleting order item:", error);
      throw new Error("Failed to delete order item");
    }
  }

  /**
   * Supprimer tous les articles d'une commande
   * @param {number} orderId ID de la commande
   * @returns {Promise<boolean>} True si supprimés, false sinon
   */
  async deleteOrderItemsByOrderId(orderId: number): Promise<boolean> {
    try {
      const query = "DELETE FROM order_items WHERE order_id = $1";
      const result = await this.pool.query(query, [orderId]);
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      console.error("Error deleting order items by order ID:", error);
      throw new Error("Failed to delete order items");
    }
  }

  /**
   * Récupérer les articles d'une commande
   * @param {number} orderId ID de la commande
   * @returns {Promise<any[]>} Liste des articles
   */
  async getItemsByOrderId(orderId: number): Promise<any[]> {
    try {
      const query = `
        SELECT 
          oi.id, oi.product_id as "productId", oi.product_name as "productName",
          oi.quantity, oi.unit_price_ht as "unitPriceHT", oi.unit_price_ttc as "unitPriceTTC",
          oi.vat_rate as "vatRate", oi.total_price_ht as "totalPriceHT", oi.total_price_ttc as "totalPriceTTC"
        FROM order_items oi
        WHERE oi.order_id = $1
        ORDER BY oi.id
      `;

      const result = await this.pool.query(query, [orderId]);
      return result.rows;
    } catch (error) {
      console.error("Error getting order items by order ID:", error);
      throw error;
    }
  }
}
