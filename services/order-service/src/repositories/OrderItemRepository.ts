import { Pool } from "pg";
import OrderItem from "../models/OrderItem";

export default class OrderItemRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  /**
   * Save order item to database
   * @param {OrderItem} item Order item entity
   * @returns {Promise<OrderItem>} Saved order item
   */
  async save(item: OrderItem): Promise<OrderItem> {
    const query = `
      INSERT INTO order_items (order_id, product_id, quantity, unit_price_ht, unit_price_ttc, 
                              vat_rate, total_price_ht, total_price_ttc, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
      RETURNING id, order_id, product_id, quantity, unit_price_ht, unit_price_ttc, 
                vat_rate, total_price_ht, total_price_ttc, created_at, updated_at
    `;

    const values = [
      item.orderId,
      item.productId,
      item.quantity,
      item.unitPriceHT,
      item.unitPriceTTC,
      item.vatRate,
      item.totalPriceHT,
      item.totalPriceTTC,
    ];

    const result = await this.pool.query(query, values);
    return OrderItem.fromDbRow(result.rows[0]);
  }

  /**
   * Update order item in database
   * @param {OrderItem} item Order item entity
   * @returns {Promise<OrderItem>} Updated order item
   */
  async update(item: OrderItem): Promise<OrderItem> {
    const query = `
      UPDATE order_items 
      SET order_id = $1, product_id = $2, quantity = $3, unit_price_ht = $4, 
          unit_price_ttc = $5, vat_rate = $6, total_price_ht = $7, total_price_ttc = $8, 
          updated_at = NOW()
      WHERE id = $9
      RETURNING id, order_id, product_id, quantity, unit_price_ht, unit_price_ttc, 
                vat_rate, total_price_ht, total_price_ttc, created_at, updated_at
    `;

    const values = [
      item.orderId,
      item.productId,
      item.quantity,
      item.unitPriceHT,
      item.unitPriceTTC,
      item.vatRate,
      item.totalPriceHT,
      item.totalPriceTTC,
      item.id,
    ];

    const result = await this.pool.query(query, values);
    return OrderItem.fromDbRow(result.rows[0]);
  }

  /**
   * Delete order item from database
   * @param {OrderItem} item Order item entity
   * @returns {Promise<boolean>} True if deleted successfully
   */
  async delete(item: OrderItem): Promise<boolean> {
    const query = "DELETE FROM order_items WHERE id = $1";
    const result = await this.pool.query(query, [item.id]);
    return result.rowCount! > 0;
  }

  /**
   * Get order item by ID
   * @param {number} id Order item ID
   * @returns {Promise<OrderItem|null>} Order item or null if not found
   */
  async getById(id: number): Promise<OrderItem | null> {
    const query = `
      SELECT id, order_id, product_id, quantity, unit_price_ht, unit_price_ttc, 
             vat_rate, total_price_ht, total_price_ttc, created_at, updated_at
      FROM order_items 
      WHERE id = $1
    `;

    const result = await this.pool.query(query, [id]);
    return result.rows.length > 0 ? OrderItem.fromDbRow(result.rows[0]) : null;
  }

  /**
   * List order items by order
   * @param {number} orderId Order ID
   * @returns {Promise<OrderItem[]>} Array of order items
   */
  async listByOrder(orderId: number): Promise<OrderItem[]> {
    const query = `
      SELECT id, order_id, product_id, quantity, unit_price_ht, unit_price_ttc, 
             vat_rate, total_price_ht, total_price_ttc, created_at, updated_at
      FROM order_items 
      WHERE order_id = $1
      ORDER BY created_at
    `;

    const result = await this.pool.query(query, [orderId]);
    return result.rows.map((row) => OrderItem.fromDbRow(row));
  }

  /**
   * Delete all order items by order
   * @param {number} orderId Order ID
   * @returns {Promise<boolean>} True if deleted successfully
   */
  async deleteAllByOrder(orderId: number): Promise<boolean> {
    const query = "DELETE FROM order_items WHERE order_id = $1";
    const result = await this.pool.query(query, [orderId]);
    return result.rowCount! > 0;
  }

  /**
   * Get order totals
   * @param {number} orderId Order ID
   * @returns {Promise<Object>} Order totals
   */
  async getOrderTotals(orderId: number): Promise<any> {
    const query = `
      SELECT 
        COALESCE(SUM(total_price_ht), 0) as totalHT,
        COALESCE(SUM(total_price_ttc), 0) as totalTTC,
        COALESCE(SUM(total_price_ttc - total_price_ht), 0) as totalVAT
      FROM order_items 
      WHERE order_id = $1
    `;

    const result = await this.pool.query(query, [orderId]);
    const row = result.rows[0];

    return {
      totalHT: parseFloat(row.totalht),
      totalTTC: parseFloat(row.totalttc),
      totalVAT: parseFloat(row.totalvat),
    };
  }
}
