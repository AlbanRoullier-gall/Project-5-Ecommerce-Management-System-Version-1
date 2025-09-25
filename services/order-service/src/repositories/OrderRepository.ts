import { Pool } from "pg";
import Order from "../models/Order";
import { OrderListOptions } from "../types";

export default class OrderRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  /**
   * Save order to database
   * @param {Order} order Order entity
   * @returns {Promise<Order>} Saved order
   */
  async save(order: Order): Promise<Order> {
    const query = `
      INSERT INTO orders (customer_id, customer_snapshot, total_amount_ht, total_amount_ttc, 
                         payment_method, notes, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      RETURNING id, customer_id, customer_snapshot, total_amount_ht, total_amount_ttc, 
                payment_method, notes, created_at, updated_at
    `;

    const values = [
      order.customerId,
      order.customerSnapshot,
      order.totalAmountHT,
      order.totalAmountTTC,
      order.paymentMethod,
      order.notes,
    ];

    const result = await this.pool.query(query, values);
    return Order.fromDbRow(result.rows[0]);
  }

  /**
   * Update order in database
   * @param {Order} order Order entity
   * @returns {Promise<Order>} Updated order
   */
  async update(order: Order): Promise<Order> {
    const query = `
      UPDATE orders 
      SET customer_id = $1, customer_snapshot = $2, total_amount_ht = $3, 
          total_amount_ttc = $4, payment_method = $5, notes = $6, updated_at = NOW()
      WHERE id = $7
      RETURNING id, customer_id, customer_snapshot, total_amount_ht, total_amount_ttc, 
                payment_method, notes, created_at, updated_at
    `;

    const values = [
      order.customerId,
      order.customerSnapshot,
      order.totalAmountHT,
      order.totalAmountTTC,
      order.paymentMethod,
      order.notes,
      order.id,
    ];

    const result = await this.pool.query(query, values);
    return Order.fromDbRow(result.rows[0]);
  }

  /**
   * Delete order from database
   * @param {Order} order Order entity
   * @returns {Promise<boolean>} True if deleted successfully
   */
  async delete(order: Order): Promise<boolean> {
    const query = "DELETE FROM orders WHERE id = $1";
    const result = await this.pool.query(query, [order.id]);
    return result.rowCount! > 0;
  }

  /**
   * Get order by ID
   * @param {number} id Order ID
   * @returns {Promise<Order|null>} Order or null if not found
   */
  async getById(id: number): Promise<Order | null> {
    const query = `
      SELECT id, customer_id, customer_snapshot, total_amount_ht, total_amount_ttc, 
             payment_method, notes, created_at, updated_at
      FROM orders 
      WHERE id = $1
    `;

    const result = await this.pool.query(query, [id]);
    return result.rows.length > 0 ? Order.fromDbRow(result.rows[0]) : null;
  }

  /**
   * Get order by ID with joins
   * @param {number} id Order ID
   * @returns {Promise<Order|null>} Order with customer info or null if not found
   */
  async getByIdWithJoins(id: number): Promise<Order | null> {
    const query = `
      SELECT o.id, o.customer_id, o.customer_snapshot, o.total_amount_ht, o.total_amount_ttc, 
             o.payment_method, o.notes, o.created_at, o.updated_at,
             c.first_name, c.last_name, c.email
      FROM orders o
      LEFT JOIN LATERAL (
        SELECT first_name, last_name, email 
        FROM jsonb_to_record(o.customer_snapshot) AS t(first_name text, last_name text, email text)
      ) c ON true
      WHERE o.id = $1
    `;

    const result = await this.pool.query(query, [id]);
    return result.rows.length > 0
      ? Order.fromDbRowWithJoins(result.rows[0])
      : null;
  }

  /**
   * List all orders with pagination and search
   * @param {Object} options Pagination and search options
   * @returns {Promise<Object>} Orders and pagination info
   */
  async listAll(options: OrderListOptions = {}): Promise<any> {
    const {
      page = 1,
      limit = 10,
      customerId,
      status,
      startDate,
      endDate,
      sort = "created_at DESC",
    } = options;

    const offset = (page - 1) * limit;
    const params: any[] = [];
    let paramCount = 0;
    const conditions: string[] = [];

    if (customerId) {
      conditions.push(`o.customer_id = $${++paramCount}`);
      params.push(customerId);
    }

    if (startDate) {
      conditions.push(`o.created_at >= $${++paramCount}`);
      params.push(startDate);
    }

    if (endDate) {
      conditions.push(`o.created_at <= $${++paramCount}`);
      params.push(endDate);
    }

    let query = `
      SELECT o.id, o.customer_id, o.total_amount_ht, o.total_amount_ttc, o.payment_method, 
             o.notes, o.created_at, o.updated_at,
             c.first_name, c.last_name, c.email
      FROM orders o
      LEFT JOIN LATERAL (
        SELECT first_name, last_name, email 
        FROM jsonb_to_record(o.customer_snapshot) AS t(first_name text, last_name text, email text)
      ) c ON true
    `;

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }

    query += ` ORDER BY o.${sort} LIMIT $${++paramCount} OFFSET $${++paramCount}`;
    params.push(limit, offset);

    const result = await this.pool.query(query, params);

    // Get total count
    let countQuery = "SELECT COUNT(*) FROM orders o";
    if (conditions.length > 0) {
      countQuery += ` WHERE ${conditions.join(" AND ")}`;
    }
    const countResult = await this.pool.query(countQuery, params.slice(0, -2));

    return {
      orders: result.rows.map((row) => Order.fromDbRowWithJoins(row)),
      pagination: {
        page,
        limit,
        total: parseInt(countResult.rows[0].count),
        pages: Math.ceil(parseInt(countResult.rows[0].count) / limit),
      },
    };
  }

  /**
   * List orders by customer
   * @param {number} customerId Customer ID
   * @returns {Promise<Order[]>} Array of orders
   */
  async listByCustomer(customerId: number): Promise<Order[]> {
    const query = `
      SELECT id, customer_id, customer_snapshot, total_amount_ht, total_amount_ttc, 
             payment_method, notes, created_at, updated_at
      FROM orders 
      WHERE customer_id = $1
      ORDER BY created_at DESC
    `;

    const result = await this.pool.query(query, [customerId]);
    return result.rows.map((row) => Order.fromDbRow(row));
  }

  /**
   * Get order statistics
   * @param {Object} options Statistics options
   * @returns {Promise<Object>} Order statistics
   */
  async getStatistics(options: OrderListOptions = {}): Promise<any> {
    const { startDate, endDate, customerId } = options;
    const params: any[] = [];
    let paramCount = 0;
    const conditions: string[] = [];

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

    let whereClause = "";
    if (conditions.length > 0) {
      whereClause = ` WHERE ${conditions.join(" AND ")}`;
    }

    const queries = [
      `SELECT COUNT(*) as total_orders FROM orders${whereClause}`,
      `SELECT COALESCE(SUM(total_amount_ttc), 0) as total_revenue FROM orders${whereClause}`,
      `SELECT COALESCE(AVG(total_amount_ttc), 0) as average_order_value FROM orders${whereClause}`,
    ];

    const [totalOrdersResult, totalRevenueResult, averageOrderValueResult] =
      await Promise.all(queries.map((query) => this.pool.query(query, params)));

    return {
      totalOrders: parseInt(totalOrdersResult.rows[0].total_orders),
      totalRevenue: parseFloat(totalRevenueResult.rows[0].total_revenue),
      averageOrderValue: parseFloat(
        averageOrderValueResult.rows[0].average_order_value
      ),
    };
  }
}
