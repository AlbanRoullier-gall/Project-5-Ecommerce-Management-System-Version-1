import { Pool } from "pg";
import OrderAddress from "../models/OrderAddress";

export default class OrderAddressRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  /**
   * Save order address to database
   * @param {OrderAddress} address Order address entity
   * @returns {Promise<OrderAddress>} Saved order address
   */
  async save(address: OrderAddress): Promise<OrderAddress> {
    const query = `
      INSERT INTO order_addresses (order_id, type, address_snapshot, created_at, updated_at)
      VALUES ($1, $2, $3, NOW(), NOW())
      RETURNING id, order_id, type, address_snapshot, created_at, updated_at
    `;

    const values = [address.orderId, address.type, address.addressSnapshot];

    const result = await this.pool.query(query, values);
    return OrderAddress.fromDbRow(result.rows[0]);
  }

  /**
   * Update order address in database
   * @param {OrderAddress} address Order address entity
   * @returns {Promise<OrderAddress>} Updated order address
   */
  async update(address: OrderAddress): Promise<OrderAddress> {
    const query = `
      UPDATE order_addresses 
      SET order_id = $1, type = $2, address_snapshot = $3, updated_at = NOW()
      WHERE id = $4
      RETURNING id, order_id, type, address_snapshot, created_at, updated_at
    `;

    const values = [
      address.orderId,
      address.type,
      address.addressSnapshot,
      address.id,
    ];

    const result = await this.pool.query(query, values);
    return OrderAddress.fromDbRow(result.rows[0]);
  }

  /**
   * Delete order address from database
   * @param {OrderAddress} address Order address entity
   * @returns {Promise<boolean>} True if deleted successfully
   */
  async delete(address: OrderAddress): Promise<boolean> {
    const query = "DELETE FROM order_addresses WHERE id = $1";
    const result = await this.pool.query(query, [address.id]);
    return result.rowCount! > 0;
  }

  /**
   * Get order address by ID
   * @param {number} id Order address ID
   * @returns {Promise<OrderAddress|null>} Order address or null if not found
   */
  async getById(id: number): Promise<OrderAddress | null> {
    const query = `
      SELECT id, order_id, type, address_snapshot, created_at, updated_at
      FROM order_addresses 
      WHERE id = $1
    `;

    const result = await this.pool.query(query, [id]);
    return result.rows.length > 0
      ? OrderAddress.fromDbRow(result.rows[0])
      : null;
  }

  /**
   * List order addresses by order
   * @param {number} orderId Order ID
   * @returns {Promise<OrderAddress[]>} Array of order addresses
   */
  async listByOrder(orderId: number): Promise<OrderAddress[]> {
    const query = `
      SELECT id, order_id, type, address_snapshot, created_at, updated_at
      FROM order_addresses 
      WHERE order_id = $1
      ORDER BY created_at
    `;

    const result = await this.pool.query(query, [orderId]);
    return result.rows.map((row) => OrderAddress.fromDbRow(row));
  }

  /**
   * Get order address by order and type
   * @param {number} orderId Order ID
   * @param {string} type Address type ('shipping' or 'billing')
   * @returns {Promise<OrderAddress|null>} Order address or null if not found
   */
  async getByOrderAndType(
    orderId: number,
    type: "shipping" | "billing"
  ): Promise<OrderAddress | null> {
    const query = `
      SELECT id, order_id, type, address_snapshot, created_at, updated_at
      FROM order_addresses 
      WHERE order_id = $1 AND type = $2
    `;

    const result = await this.pool.query(query, [orderId, type]);
    return result.rows.length > 0
      ? OrderAddress.fromDbRow(result.rows[0])
      : null;
  }

  /**
   * Delete all order addresses by order
   * @param {number} orderId Order ID
   * @returns {Promise<boolean>} True if deleted successfully
   */
  async deleteAllByOrder(orderId: number): Promise<boolean> {
    const query = "DELETE FROM order_addresses WHERE order_id = $1";
    const result = await this.pool.query(query, [orderId]);
    return result.rowCount! > 0;
  }
}
