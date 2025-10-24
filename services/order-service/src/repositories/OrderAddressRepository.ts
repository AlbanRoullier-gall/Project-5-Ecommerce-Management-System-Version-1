import { Pool } from "pg";
import OrderAddress, { OrderAddressData } from "../models/OrderAddress";

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
      RETURNING id, order_id, type AS address_type, address_snapshot, created_at, updated_at
    `;

    const values = [
      address.orderId,
      address.addressType,
      address.addressSnapshot,
    ];

    const result = await this.pool.query(query, values);
    return new OrderAddress(result.rows[0]);
  }

  /**
   * Update order address in database
   * @param {OrderAddress} address Order address entity
   * @returns {Promise<OrderAddress>} Updated order address
   */
  async update(address: OrderAddress): Promise<OrderAddress> {
    const query = `
      UPDATE order_addresses 
      SET order_id = $1, type = $2, address_snapshot = $3
      WHERE id = $4
      RETURNING id, order_id, type AS address_type, address_snapshot, created_at, updated_at
    `;

    const values = [
      address.orderId,
      address.addressType,
      address.addressSnapshot,
      address.id,
    ];

    const result = await this.pool.query(query, values);
    return new OrderAddress(result.rows[0]);
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
      SELECT id, order_id, type AS address_type, address_snapshot, created_at, updated_at
      FROM order_addresses 
      WHERE id = $1
    `;

    const result = await this.pool.query(query, [id]);
    return result.rows.length > 0 ? new OrderAddress(result.rows[0]) : null;
  }

  /**
   * List order addresses by order
   * @param {number} orderId Order ID
   * @returns {Promise<OrderAddress[]>} Array of order addresses
   */
  async listByOrder(orderId: number): Promise<OrderAddress[]> {
    const query = `
      SELECT id, order_id, type AS address_type, address_snapshot, created_at, updated_at
      FROM order_addresses 
      WHERE order_id = $1
      ORDER BY created_at
    `;

    const result = await this.pool.query(query, [orderId]);
    return result.rows.map((row) => new OrderAddress(row));
  }

  /**
   * Get order address by order and addressType
   * @param {number} orderId Order ID
   * @param {string} addressType Address addressType ('shipping' or 'billing')
   * @returns {Promise<OrderAddress|null>} Order address or null if not found
   */
  async getByOrderAndType(
    orderId: number,
    addressType: "shipping" | "billing"
  ): Promise<OrderAddress | null> {
    const query = `
      SELECT id, order_id, type AS address_type, address_snapshot, created_at, updated_at
      FROM order_addresses 
      WHERE order_id = $1 AND type = $2
    `;

    const result = await this.pool.query(query, [orderId, addressType]);
    return result.rows.length > 0 ? new OrderAddress(result.rows[0]) : null;
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

  /**
   * Create order address
   */
  async createOrderAddress(
    orderAddressData: OrderAddressData
  ): Promise<OrderAddress> {
    const query = `
      INSERT INTO order_addresses (
        order_id, type, address_snapshot
      ) VALUES ($1, $2, $3)
      RETURNING id, order_id, type AS address_type, address_snapshot, created_at, updated_at
    `;

    const values = [
      orderAddressData.order_id,
      orderAddressData.address_type,
      orderAddressData.address_snapshot,
    ];

    const result = await this.pool.query(query, values);
    return new OrderAddress(result.rows[0]);
  }

  /**
   * Get order address by ID
   */
  async getOrderAddressById(id: number): Promise<OrderAddress | null> {
    const query = `SELECT id, order_id, type AS address_type, address_snapshot, created_at, updated_at FROM order_addresses WHERE id = $1`;
    const result = await this.pool.query(query, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    return new OrderAddress(result.rows[0]);
  }

  /**
   * Update order address
   */
  async updateOrderAddress(
    id: number,
    orderAddressData: Partial<OrderAddressData>
  ): Promise<OrderAddress> {
    const fields = [];
    const values = [];
    let paramCount = 0;

    if (orderAddressData.order_id !== undefined) {
      fields.push(`order_id = $${++paramCount}`);
      values.push(orderAddressData.order_id);
    }
    if (orderAddressData.address_type !== undefined) {
      fields.push(`type = $${++paramCount}`);
      values.push(orderAddressData.address_type);
    }
    if (orderAddressData.address_snapshot !== undefined) {
      fields.push(`address_snapshot = $${++paramCount}`);
      values.push(orderAddressData.address_snapshot);
    }

    if (fields.length === 0) {
      throw new Error("No fields to update");
    }

    values.push(id);

    const query = `
      UPDATE order_addresses 
      SET ${fields.join(", ")} 
      WHERE id = $${++paramCount}
      RETURNING id, order_id, type AS address_type, address_snapshot, created_at, updated_at
    `;

    const result = await this.pool.query(query, values);
    if (result.rows.length === 0) {
      throw new Error("Order address not found");
    }

    return new OrderAddress(result.rows[0]);
  }

  /**
   * Delete order address
   */
  async deleteOrderAddress(id: number): Promise<boolean> {
    const query = `DELETE FROM order_addresses WHERE id = $1`;
    const result = await this.pool.query(query, [id]);
    return result.rowCount! > 0;
  }

  /**
   * Get order addresses by order ID
   */
  async getOrderAddressesByOrderId(orderId: number): Promise<OrderAddress[]> {
    const query = `
      SELECT id, order_id, type AS address_type, address_snapshot, created_at, updated_at
      FROM order_addresses 
      WHERE order_id = $1 
      ORDER BY created_at
    `;

    const result = await this.pool.query(query, [orderId]);
    return result.rows.map((row) => new OrderAddress(row));
  }

  /**
   * Récupérer les adresses d'une commande pour l'export
   * @param {number} orderId ID de la commande
   * @returns {Promise<any[]>} Liste des adresses
   */
  async getAddressesByOrderId(orderId: number): Promise<any[]> {
    try {
      const query = `
        SELECT 
          oa.id, oa.type, oa.address_snapshot as "addressSnapshot"
        FROM order_addresses oa
        WHERE oa.order_id = $1
        ORDER BY oa.id
      `;

      const result = await this.pool.query(query, [orderId]);
      // Parse the address_snapshot JSON for each address
      return result.rows.map((row) => ({
        id: row.id,
        type: row.type,
        ...(row.addressSnapshot || {}),
      }));
    } catch (error) {
      console.error("Error getting order addresses by order ID:", error);
      throw error;
    }
  }
}
