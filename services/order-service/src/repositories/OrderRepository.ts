/**
 * OrderRepository
 * Gestion des opérations de base de données pour les commandes
 *
 * Architecture : Repository pattern
 * - Abstraction de la couche de données
 * - Opérations CRUD pour les commandes
 * - Gestion des transactions
 */
import { Pool } from "pg";
import Order, { OrderData } from "../models/Order";

export interface OrderListOptions {
  page?: number;
  limit?: number;
  search?: string;
  customerId?: number | undefined;
  status?: string;
  startDate?: string;
  endDate?: string;
  sort?: string;
}

export default class OrderRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  /**
   * Créer une nouvelle commande
   * @param {OrderData} orderData Données de la commande
   * @returns {Promise<Order>} Commande créée
   */
  async createOrder(orderData: OrderData): Promise<Order> {
    try {
      const query = `
        INSERT INTO orders (customer_id, customer_snapshot, total_amount_ht, total_amount_ttc, 
                           payment_method, notes, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
        RETURNING id, customer_id, customer_snapshot, total_amount_ht, total_amount_ttc, 
                  payment_method, notes, created_at, updated_at
      `;

      const values = [
        orderData.customer_id,
        orderData.customer_snapshot,
        orderData.total_amount_ht,
        orderData.total_amount_ttc,
        orderData.payment_method,
        orderData.notes,
      ];

      const result = await this.pool.query(query, values);
      return new Order(result.rows[0] as OrderData);
    } catch (error) {
      console.error("Error creating order:", error);
      throw new Error("Failed to create order");
    }
  }

  /**
   * Récupérer une commande par ID
   * @param {number} id ID de la commande
   * @returns {Promise<Order | null>} Commande trouvée ou null
   */
  async getOrderById(id: number): Promise<Order | null> {
    try {
      const query = `
        SELECT id, customer_id, customer_snapshot, total_amount_ht, total_amount_ttc, 
               payment_method, notes, created_at, updated_at
        FROM orders 
        WHERE id = $1
      `;

      const result = await this.pool.query(query, [id]);

      if (result.rows.length === 0) {
        return null;
      }

      return new Order(result.rows[0] as OrderData);
    } catch (error) {
      console.error("Error getting order by ID:", error);
      throw new Error("Failed to retrieve order");
    }
  }

  /**
   * Récupérer une commande par ID avec données jointes
   * @param {number} id ID de la commande
   * @returns {Promise<Order | null>} Commande avec données jointes ou null
   */
  async getOrderByIdWithJoins(id: number): Promise<Order | null> {
    try {
      const query = `
        SELECT 
          o.id, 
          o.customer_id, 
          o.customer_snapshot, 
          o.total_amount_ht, 
          o.total_amount_ttc, 
          o.payment_method, 
          o.notes, 
          o.created_at, 
          o.updated_at,
          COALESCE(
            o.customer_snapshot->>'first_name',
            o.customer_snapshot->>'firstName',
            o.customer_snapshot->>'firstname'
          ) AS first_name,
          COALESCE(
            o.customer_snapshot->>'last_name',
            o.customer_snapshot->>'lastName',
            o.customer_snapshot->>'lastname'
          ) AS last_name,
          COALESCE(
            o.customer_snapshot->>'email',
            o.customer_snapshot->>'emailAddress'
          ) AS email
        FROM orders o
        WHERE o.id = $1
      `;

      const result = await this.pool.query(query, [id]);

      if (result.rows.length === 0) {
        return null;
      }

      const order = new Order(result.rows[0] as OrderData);
      order.customerFirstName = result.rows[0].first_name;
      order.customerLastName = result.rows[0].last_name;
      order.customerEmail = result.rows[0].email;
      return order;
    } catch (error) {
      console.error("Error getting order by ID with joins:", error);
      throw new Error("Failed to retrieve order");
    }
  }

  /**
   * Mettre à jour une commande
   * @param {number} id ID de la commande
   * @param {Partial<OrderData>} orderData Données à mettre à jour
   * @returns {Promise<Order | null>} Commande mise à jour ou null
   */
  async updateOrder(
    id: number,
    orderData: Partial<OrderData>
  ): Promise<Order | null> {
    try {
      const setClause = [];
      const values = [];
      let paramCount = 0;

      if (orderData.customer_snapshot !== undefined) {
        setClause.push(`customer_snapshot = $${++paramCount}`);
        values.push(orderData.customer_snapshot);
      }

      if (orderData.total_amount_ht !== undefined) {
        setClause.push(`total_amount_ht = $${++paramCount}`);
        values.push(orderData.total_amount_ht);
      }

      if (orderData.total_amount_ttc !== undefined) {
        setClause.push(`total_amount_ttc = $${++paramCount}`);
        values.push(orderData.total_amount_ttc);
      }

      if (orderData.payment_method !== undefined) {
        setClause.push(`payment_method = $${++paramCount}`);
        values.push(orderData.payment_method);
      }

      if (orderData.notes !== undefined) {
        setClause.push(`notes = $${++paramCount}`);
        values.push(orderData.notes);
      }

      if (setClause.length === 0) {
        return this.getOrderById(id);
      }

      values.push(id);

      const query = `
        UPDATE orders 
        SET ${setClause.join(", ")}
        WHERE id = $${++paramCount}
        RETURNING id, customer_id, customer_snapshot, total_amount_ht, total_amount_ttc, 
                  payment_method, notes, created_at, updated_at
      `;

      const result = await this.pool.query(query, values);

      if (result.rows.length === 0) {
        return null;
      }

      return new Order(result.rows[0] as OrderData);
    } catch (error) {
      console.error("Error updating order:", error);
      throw new Error("Failed to update order");
    }
  }

  /**
   * Supprimer une commande
   * @param {number} id ID de la commande
   * @returns {Promise<boolean>} True si supprimée, false sinon
   */
  async deleteOrder(id: number): Promise<boolean> {
    try {
      const query = "DELETE FROM orders WHERE id = $1";
      const result = await this.pool.query(query, [id]);
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      console.error("Error deleting order:", error);
      throw new Error("Failed to delete order");
    }
  }

  /**
   * Lister les commandes avec pagination
   * @param {OrderListOptions} options Options de filtrage et pagination
   * @returns {Promise<{orders: Order[], pagination: any}>} Liste des commandes et pagination
   */
  async listOrders(
    options: OrderListOptions = {}
  ): Promise<{ orders: Order[]; pagination: any }> {
    try {
      const { page = 1, limit = 10, search, customerId } = options;

      const offset = (page - 1) * limit;
      const conditions = [];
      const params = [];
      let paramCount = 0;

      if (customerId) {
        conditions.push(`customer_id = $${++paramCount}`);
        params.push(customerId);
      }

      if (search) {
        conditions.push(
          `(notes ILIKE $${++paramCount} OR payment_method ILIKE $${++paramCount})`
        );
        params.push(`%${search}%`, `%${search}%`);
      }

      const whereClause =
        conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

      const query = `
        SELECT 
          o.id, 
          o.customer_id, 
          o.customer_snapshot, 
          o.total_amount_ht, 
          o.total_amount_ttc, 
          o.payment_method, 
          o.notes, 
          o.created_at, 
          o.updated_at,
          COALESCE(
            o.customer_snapshot->>'first_name',
            o.customer_snapshot->>'firstName',
            o.customer_snapshot->>'firstname'
          ) AS first_name,
          COALESCE(
            o.customer_snapshot->>'last_name',
            o.customer_snapshot->>'lastName',
            o.customer_snapshot->>'lastname'
          ) AS last_name,
          COALESCE(
            o.customer_snapshot->>'email',
            o.customer_snapshot->>'emailAddress'
          ) AS email
        FROM orders o
        ${whereClause}
        ORDER BY o.created_at DESC
        LIMIT $${++paramCount} OFFSET $${++paramCount}
      `;

      params.push(limit, offset);

      const result = await this.pool.query(query, params);

      // Compter le total
      const countQuery = `SELECT COUNT(*) FROM orders ${whereClause}`;
      const countResult = await this.pool.query(
        countQuery,
        params.slice(0, -2)
      );

      return {
        orders: result.rows.map((row) => {
          const order = new Order(row as OrderData);
          order.customerFirstName = (row as any).first_name;
          order.customerLastName = (row as any).last_name;
          order.customerEmail = (row as any).email;
          return order;
        }),
        pagination: {
          page,
          limit,
          total: parseInt(countResult.rows[0].count),
          pages: Math.ceil(parseInt(countResult.rows[0].count) / limit),
        },
      };
    } catch (error) {
      console.error("Error listing orders:", error);
      throw new Error("Failed to retrieve orders");
    }
  }

  /**
   * Vérifier si une commande existe
   * @param {number} id ID de la commande
   * @returns {Promise<boolean>} True si existe, false sinon
   */
  async orderExists(id: number): Promise<boolean> {
    try {
      const query = "SELECT 1 FROM orders WHERE id = $1";
      const result = await this.pool.query(query, [id]);
      return result.rows.length > 0;
    } catch (error) {
      console.error("Error checking if order exists:", error);
      return false;
    }
  }
}
