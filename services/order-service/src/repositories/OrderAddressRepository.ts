import { Pool } from "pg";
import OrderAddress, { OrderAddressData } from "../models/OrderAddress";

export default class OrderAddressRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  /**
   * Sauvegarder une adresse de commande en base de données
   * @param {OrderAddress} address Entité adresse de commande
   * @returns {Promise<OrderAddress>} Adresse de commande sauvegardée
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
   * Mettre à jour une adresse de commande en base de données
   * @param {OrderAddress} address Entité adresse de commande
   * @returns {Promise<OrderAddress>} Adresse de commande mise à jour
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
   * Supprimer une adresse de commande de la base de données
   * @param {OrderAddress} address Entité adresse de commande
   * @returns {Promise<boolean>} True si supprimée avec succès
   */
  async delete(address: OrderAddress): Promise<boolean> {
    const query = "DELETE FROM order_addresses WHERE id = $1";
    const result = await this.pool.query(query, [address.id]);
    return result.rowCount! > 0;
  }

  /**
   * Obtenir une adresse de commande par ID
   * @param {number} id ID de l'adresse de commande
   * @returns {Promise<OrderAddress|null>} Adresse de commande ou null si non trouvée
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
   * Lister les adresses de commande par commande
   * @param {number} orderId ID de la commande
   * @returns {Promise<OrderAddress[]>} Tableau des adresses de commande
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
   * Obtenir une adresse de commande par commande et type d'adresse
   * @param {number} orderId ID de la commande
   * @param {string} addressType Type d'adresse ('shipping' ou 'billing')
   * @returns {Promise<OrderAddress|null>} Adresse de commande ou null si non trouvée
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
   * Supprimer toutes les adresses de commande par commande
   * @param {number} orderId ID de la commande
   * @returns {Promise<boolean>} True si supprimées avec succès
   */
  async deleteAllByOrder(orderId: number): Promise<boolean> {
    const query = "DELETE FROM order_addresses WHERE order_id = $1";
    const result = await this.pool.query(query, [orderId]);
    return result.rowCount! > 0;
  }

  /**
   * Créer une adresse de commande
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
   * Obtenir une adresse de commande par ID
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
   * Mettre à jour une adresse de commande
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
   * Supprimer une adresse de commande
   */
  async deleteOrderAddress(id: number): Promise<boolean> {
    const query = `DELETE FROM order_addresses WHERE id = $1`;
    const result = await this.pool.query(query, [id]);
    return result.rowCount! > 0;
  }

  /**
   * Obtenir les adresses de commande par ID de commande
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
      // Analyser le JSON address_snapshot pour chaque adresse
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
