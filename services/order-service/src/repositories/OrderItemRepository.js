/**
 * OrderItemRepository
 * Handles database operations for OrderItem entities
 */
const OrderItem = require("../models/OrderItem");

class OrderItemRepository {
  constructor(pool) {
    this.pool = pool;
  }

  /**
   * Get order item by ID
   * @param {number} id Item ID
   * @returns {Promise<OrderItem|null>} OrderItem or null if not found
   */
  async getById(id) {
    try {
      const result = await this.pool.query(
        `SELECT id, order_id, product_id, quantity, unit_price_ht, unit_price_ttc, 
                vat_rate, total_price_ht, total_price_ttc, created_at, updated_at
         FROM order_items 
         WHERE id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return OrderItem.fromDbRow(result.rows[0]);
    } catch (error) {
      console.error("Error getting order item by ID:", error);
      throw new Error("Failed to retrieve order item");
    }
  }

  /**
   * List items by order ID
   * @param {number} orderId Order ID
   * @returns {Promise<OrderItem[]>} Array of order items
   */
  async listByOrder(orderId) {
    try {
      const result = await this.pool.query(
        `SELECT id, order_id, product_id, quantity, unit_price_ht, unit_price_ttc, 
                vat_rate, total_price_ht, total_price_ttc, created_at, updated_at
         FROM order_items 
         WHERE order_id = $1
         ORDER BY created_at`,
        [orderId]
      );

      return result.rows.map((row) => OrderItem.fromDbRow(row));
    } catch (error) {
      console.error("Error listing order items:", error);
      throw new Error("Failed to retrieve order items");
    }
  }

  /**
   * Save new order item
   * @param {OrderItem} item OrderItem entity to save
   * @returns {Promise<OrderItem>} Saved item with ID
   */
  async save(item) {
    try {
      const validation = item.validate();
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
      }

      const result = await this.pool.query(
        `INSERT INTO order_items (order_id, product_id, quantity, unit_price_ht, 
                                  unit_price_ttc, vat_rate, total_price_ht, total_price_ttc, 
                                  created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
         RETURNING id, order_id, product_id, quantity, unit_price_ht, unit_price_ttc, 
                   vat_rate, total_price_ht, total_price_ttc, created_at, updated_at`,
        [
          item.orderId,
          item.productId,
          item.quantity,
          item.unitPriceHT,
          item.unitPriceTTC,
          item.vatRate,
          item.totalPriceHT,
          item.totalPriceTTC,
        ]
      );

      return OrderItem.fromDbRow(result.rows[0]);
    } catch (error) {
      console.error("Error saving order item:", error);
      throw new Error("Failed to save order item");
    }
  }

  /**
   * Update existing order item
   * @param {OrderItem} item OrderItem entity to update
   * @returns {Promise<OrderItem>} Updated item
   */
  async update(item) {
    try {
      const validation = item.validate();
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
      }

      const result = await this.pool.query(
        `UPDATE order_items 
         SET order_id = $1, product_id = $2, quantity = $3, unit_price_ht = $4, 
             unit_price_ttc = $5, vat_rate = $6, total_price_ht = $7, total_price_ttc = $8, 
             updated_at = NOW()
         WHERE id = $9
         RETURNING id, order_id, product_id, quantity, unit_price_ht, unit_price_ttc, 
                   vat_rate, total_price_ht, total_price_ttc, created_at, updated_at`,
        [
          item.orderId,
          item.productId,
          item.quantity,
          item.unitPriceHT,
          item.unitPriceTTC,
          item.vatRate,
          item.totalPriceHT,
          item.totalPriceTTC,
          item.id,
        ]
      );

      if (result.rows.length === 0) {
        throw new Error("Order item not found");
      }

      return OrderItem.fromDbRow(result.rows[0]);
    } catch (error) {
      console.error("Error updating order item:", error);
      throw new Error("Failed to update order item");
    }
  }

  /**
   * Delete order item
   * @param {OrderItem} item OrderItem entity to delete
   * @returns {Promise<boolean>} True if deleted successfully
   */
  async delete(item) {
    try {
      const result = await this.pool.query(
        "DELETE FROM order_items WHERE id = $1 RETURNING id",
        [item.id]
      );

      return result.rows.length > 0;
    } catch (error) {
      console.error("Error deleting order item:", error);
      throw new Error("Failed to delete order item");
    }
  }

  /**
   * Delete all items for an order
   * @param {number} orderId Order ID
   * @returns {Promise<number>} Number of items deleted
   */
  async deleteAllByOrder(orderId) {
    try {
      const result = await this.pool.query(
        "DELETE FROM order_items WHERE order_id = $1 RETURNING id",
        [orderId]
      );

      return result.rows.length;
    } catch (error) {
      console.error("Error deleting order items:", error);
      throw new Error("Failed to delete order items");
    }
  }

  /**
   * Count items for order
   * @param {number} orderId Order ID
   * @returns {Promise<number>} Number of items
   */
  async countByOrder(orderId) {
    try {
      const result = await this.pool.query(
        "SELECT COUNT(*) FROM order_items WHERE order_id = $1",
        [orderId]
      );

      return parseInt(result.rows[0].count);
    } catch (error) {
      console.error("Error counting order items:", error);
      throw new Error("Failed to count order items");
    }
  }

  /**
   * Get order totals
   * @param {number} orderId Order ID
   * @returns {Promise<Object>} Order totals
   */
  async getOrderTotals(orderId) {
    try {
      const result = await this.pool.query(
        `SELECT 
          SUM(total_price_ht) as total_ht,
          SUM(total_price_ttc) as total_ttc,
          SUM(total_price_ttc - total_price_ht) as total_vat
         FROM order_items 
         WHERE order_id = $1`,
        [orderId]
      );

      return {
        totalHT: parseFloat(result.rows[0].total_ht) || 0,
        totalTTC: parseFloat(result.rows[0].total_ttc) || 0,
        totalVAT: parseFloat(result.rows[0].total_vat) || 0,
      };
    } catch (error) {
      console.error("Error getting order totals:", error);
      throw new Error("Failed to get order totals");
    }
  }
}

module.exports = OrderItemRepository;
