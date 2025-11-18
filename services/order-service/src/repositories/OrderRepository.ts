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
  year?: number | undefined;
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
                           payment_method, notes, payment_intent_id, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
        ON CONFLICT (payment_intent_id) WHERE payment_intent_id IS NOT NULL DO UPDATE SET updated_at = NOW()
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
        (orderData as any).payment_intent_id || null,
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
               payment_method, notes, delivered, created_at, updated_at
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
          o.delivered,
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
      const { page = 1, limit = 10, search, customerId, year } = options;

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

      if (year) {
        conditions.push(`EXTRACT(YEAR FROM created_at) = $${++paramCount}`);
        params.push(year);
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
          o.delivered,
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
   * Obtenir le total HT des commandes (avec filtres optionnels)
   * @param {OrderListOptions} options Options de filtrage
   * @returns {Promise<number>} Somme HT
   */
  async getOrdersTotalHT(options: OrderListOptions = {}): Promise<number> {
    try {
      const { customerId, startDate, endDate } = options as any;

      const conditions: string[] = [];
      const params: any[] = [];
      let paramCount = 0;

      if (customerId) {
        conditions.push(`customer_id = $${++paramCount}`);
        params.push(customerId);
      }

      if (startDate) {
        conditions.push(`created_at >= $${++paramCount}`);
        params.push(startDate);
      }

      if (endDate) {
        conditions.push(`created_at <= $${++paramCount}`);
        params.push(endDate);
      }

      const whereClause =
        conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

      const query = `
        SELECT COALESCE(SUM(total_amount_ht), 0) AS total_ht
        FROM orders
        ${whereClause}
      `;

      const result = await this.pool.query(query, params);
      const row = result.rows[0];
      // pg retourne DECIMAL comme string → parseFloat en sécurité
      return parseFloat(row.total_ht);
    } catch (error) {
      console.error("Error getting orders total HT:", error);
      throw new Error("Failed to retrieve orders total HT");
    }
  }

  /**
   * Obtenir les totaux HT et TTC des commandes (avec filtres optionnels)
   * @param {OrderListOptions} options Options de filtrage
   * @returns {Promise<{ totalHT: number; totalTTC: number }>} Totaux
   */
  async getOrdersTotals(
    options: OrderListOptions = {}
  ): Promise<{ totalHT: number; totalTTC: number }> {
    try {
      const { customerId, startDate, endDate, year } = options as any;

      const conditions: string[] = [];
      const params: any[] = [];
      let paramCount = 0;

      if (customerId) {
        conditions.push(`customer_id = $${++paramCount}`);
        params.push(customerId);
      }

      if (startDate) {
        conditions.push(`created_at >= $${++paramCount}`);
        params.push(startDate);
      }

      if (endDate) {
        conditions.push(`created_at <= $${++paramCount}`);
        params.push(endDate);
      }

      if (year) {
        conditions.push(`EXTRACT(YEAR FROM created_at) = $${++paramCount}`);
        params.push(year);
      }

      const whereClause =
        conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

      const query = `
        SELECT 
          COALESCE(SUM(total_amount_ht), 0) AS total_ht,
          COALESCE(SUM(total_amount_ttc), 0) AS total_ttc
        FROM orders
        ${whereClause}
      `;

      const result = await this.pool.query(query, params);
      const row = result.rows[0];
      return {
        totalHT: parseFloat(row.total_ht),
        totalTTC: parseFloat(row.total_ttc),
      };
    } catch (error) {
      console.error("Error getting orders totals:", error);
      throw new Error("Failed to retrieve orders totals");
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

  /**
   * Mettre à jour l'état de livraison d'une commande
   * @param {number} id ID de la commande
   * @param {boolean} delivered État de livraison
   * @returns {Promise<Order | null>} Commande mise à jour ou null
   */
  async updateDeliveryStatus(
    id: number,
    delivered: boolean
  ): Promise<Order | null> {
    try {
      const query = `
        UPDATE orders 
        SET delivered = $1, updated_at = NOW()
        WHERE id = $2
        RETURNING id, customer_id, customer_snapshot, total_amount_ht, total_amount_ttc, 
                  payment_method, notes, delivered, created_at, updated_at
      `;

      const result = await this.pool.query(query, [delivered, id]);

      if (result.rows.length === 0) {
        return null;
      }

      return new Order(result.rows[0] as OrderData);
    } catch (error) {
      console.error("Error updating delivery status:", error);
      throw new Error("Failed to update delivery status");
    }
  }

  /**
   * Récupérer les commandes par année pour l'export
   * @param {number} year Année
   * @returns {Promise<any[]>} Liste des commandes
   */
  async getOrdersByYear(year: number): Promise<any[]> {
    try {
      // D'abord, compter le total de commandes dans la base
      const countQuery = `SELECT COUNT(*) as total FROM orders`;
      const countResult = await this.pool.query(countQuery);
      const totalOrders = parseInt(countResult.rows[0].total);

      // Vérifier s'il y a des commandes avec des dates NULL ou invalides
      const nullDateQuery = `
        SELECT id, created_at, EXTRACT(YEAR FROM created_at) as year
        FROM orders
        WHERE created_at IS NULL OR EXTRACT(YEAR FROM created_at) IS NULL
        ORDER BY id
      `;
      const nullDateResult = await this.pool.query(nullDateQuery);
      if (nullDateResult.rows.length > 0) {
        console.log(
          `⚠️ Commandes avec dates NULL ou invalides:`,
          nullDateResult.rows
        );
      }

      // Voir la distribution par année (y compris NULL)
      const yearDistributionQuery = `
        SELECT 
          COALESCE(EXTRACT(YEAR FROM created_at)::text, 'NULL') as year,
          COUNT(*) as count,
          ARRAY_AGG(id ORDER BY id) as ids
        FROM orders
        GROUP BY EXTRACT(YEAR FROM created_at)
        ORDER BY year DESC NULLS LAST
      `;
      const yearDistributionResult = await this.pool.query(
        yearDistributionQuery
      );
      console.log(
        `📊 Distribution des commandes par année:`,
        yearDistributionResult.rows
      );

      // Compter les commandes de l'année
      const yearCountQuery = `
        SELECT COUNT(*) as total 
        FROM orders o
        WHERE EXTRACT(YEAR FROM o.created_at) = $1
      `;
      const yearCountResult = await this.pool.query(yearCountQuery, [year]);
      const yearOrders = parseInt(yearCountResult.rows[0].total);

      // Vérifier aussi avec une comparaison de dates pour être sûr
      const yearRangeStart = `${year}-01-01 00:00:00`;
      const yearRangeEnd = `${year + 1}-01-01 00:00:00`;
      const yearRangeQuery = `
        SELECT COUNT(*) as total 
        FROM orders o
        WHERE o.created_at >= $1::timestamp 
          AND o.created_at < $2::timestamp
      `;
      const yearRangeResult = await this.pool.query(yearRangeQuery, [
        yearRangeStart,
        yearRangeEnd,
      ]);
      const yearRangeOrders = parseInt(yearRangeResult.rows[0].total);

      console.log(
        `📊 Base de données: ${totalOrders} commandes au total, ${yearOrders} commandes pour l'année ${year} (EXTRACT), ${yearRangeOrders} commandes (date range)`
      );

      // Lister toutes les commandes pour debug
      const allOrdersQuery = `
        SELECT id, created_at, EXTRACT(YEAR FROM created_at) as year
        FROM orders
        ORDER BY id
      `;
      const allOrdersResult = await this.pool.query(allOrdersQuery);
      console.log(
        `📊 Total de commandes listées: ${allOrdersResult.rows.length}`
      );

      // Récupérer toutes les commandes de l'année
      // Utiliser une comparaison de dates pour être plus robuste avec les timezones
      const startOfYear = `${year}-01-01 00:00:00`;
      const endOfYear = `${year + 1}-01-01 00:00:00`;
      const query = `
        SELECT 
          o.id, o.customer_id as "customerId", o.customer_snapshot as "customerSnapshot",
          o.total_amount_ht as "totalAmountHT", o.total_amount_ttc as "totalAmountTTC",
          o.payment_method as "paymentMethod", o.notes, o.delivered,
          o.created_at as "createdAt", o.updated_at as "updatedAt"
        FROM orders o
        WHERE o.created_at >= $1::timestamp 
          AND o.created_at < $2::timestamp
        ORDER BY o.created_at DESC
      `;

      const result = await this.pool.query(query, [startOfYear, endOfYear]);
      console.log(
        `📊 Requête exécutée: ${result.rows.length} commandes retournées pour l'année ${year} (date range: ${startOfYear} à ${endOfYear})`
      );

      // Vérifier aussi avec EXTRACT pour comparer
      const extractQuery = `
        SELECT COUNT(*) as count
        FROM orders o
        WHERE EXTRACT(YEAR FROM o.created_at) = $1
      `;
      const extractResult = await this.pool.query(extractQuery, [year]);
      const extractCount = parseInt(extractResult.rows[0].count);
      console.log(
        `📊 Comparaison EXTRACT: ${extractCount} commandes pour l'année ${year}`
      );

      if (result.rows.length !== extractCount) {
        console.warn(
          `⚠️ Différence entre date range (${result.rows.length}) et EXTRACT (${extractCount})`
        );
      }

      return result.rows;
    } catch (error) {
      console.error("Error getting orders by year:", error);
      throw error;
    }
  }
}
