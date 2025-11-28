import { Pool } from "pg";
import OrderAddress from "../models/OrderAddress";

export default class OrderAddressRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  /**
   * Sauvegarder une adresse de commande en base de données
   * @param {OrderAddress} address Entité adresse de commande
   * @param {any} client Client de transaction optionnel (pour les transactions)
   * @returns {Promise<OrderAddress>} Adresse de commande sauvegardée
   */
  async save(address: OrderAddress, client?: any): Promise<OrderAddress> {
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

    const executor = client || this.pool;
    const result = await executor.query(query, values);
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
