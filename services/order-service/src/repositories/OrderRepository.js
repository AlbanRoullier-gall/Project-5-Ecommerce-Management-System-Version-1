/**
 * OrderRepository
 * Handles database operations for Order entities
 */
const Order = require("../models/Order");

class OrderRepository {
  constructor(pool) {
    this.pool = pool;
  }

  /**
   * Get order by ID
   * @param {number} id Order ID
   * @returns {Promise<Order|null>} Order or null if not found
   */
  async getById(id) {
    try {
      const result = await this.pool.query(
        `SELECT id, customer_id, customer_snapshot, total_amount_ht, total_amount_ttc, 
                payment_method, notes, created_at, updated_at
         FROM orders 
         WHERE id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return Order.fromDbRow(result.rows[0]);
    } catch (error) {
      console.error("Error getting order by ID:", error);
      throw new Error("Failed to retrieve order");
    }
  }

  /**
   * Get order by ID with joins
   * @param {number} id Order ID
   * @returns {Promise<Order|null>} Order with joined data or null if not found
   */
  async getByIdWithJoins(id) {
    try {
      const result = await this.pool.query(
        `SELECT o.id, o.customer_id, o.customer_snapshot, o.total_amount_ht, o.total_amount_ttc, 
                o.payment_method, o.notes, o.created_at, o.updated_at,
                c.first_name, c.last_name, c.email
         FROM orders o
         LEFT JOIN customers c ON o.customer_id = c.customer_id
         WHERE o.id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return Order.fromDbRowWithJoins(result.rows[0]);
    } catch (error) {
      console.error("Error getting order by ID with joins:", error);
      throw new Error("Failed to retrieve order");
    }
  }

  /**
   * List orders by customer
   * @param {number} customerId Customer ID
   * @returns {Promise<Order[]>} Array of orders
   */
  async listByCustomer(customerId) {
    try {
      const result = await this.pool.query(
        `SELECT o.id, o.customer_id, o.customer_snapshot, o.total_amount_ht, o.total_amount_ttc, 
                o.payment_method, o.notes, o.created_at, o.updated_at,
                c.first_name, c.last_name, c.email
         FROM orders o
         LEFT JOIN customers c ON o.customer_id = c.customer_id
         WHERE o.customer_id = $1
         ORDER BY o.created_at DESC`,
        [customerId]
      );

      return result.rows.map((row) => Order.fromDbRowWithJoins(row));
    } catch (error) {
      console.error("Error listing orders by customer:", error);
      throw new Error("Failed to retrieve orders");
    }
  }

  /**
   * List all orders with pagination and search
   * @param {Object} options Pagination and search options
   * @returns {Promise<Object>} Orders and pagination info
   */
  async listAll(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        search = "",
        customerId,
        startDate,
        endDate,
      } = options;
      const offset = (page - 1) * limit;

      let query = `
        SELECT o.id, o.customer_id, o.customer_snapshot, o.total_amount_ht, o.total_amount_ttc, 
               o.payment_method, o.notes, o.created_at, o.updated_at,
               c.first_name, c.last_name, c.email
        FROM orders o
        LEFT JOIN customers c ON o.customer_id = c.customer_id
      `;

      const params = [];
      let paramCount = 0;
      const conditions = [];

      if (customerId) {
        conditions.push(`o.customer_id = $${++paramCount}`);
        params.push(customerId);
      }

      if (search) {
        conditions.push(
          `(c.first_name ILIKE $${++paramCount} OR c.last_name ILIKE $${paramCount} OR c.email ILIKE $${paramCount})`
        );
        params.push(`%${search}%`);
      }

      if (startDate) {
        conditions.push(`o.created_at >= $${++paramCount}`);
        params.push(startDate);
      }

      if (endDate) {
        conditions.push(`o.created_at <= $${++paramCount}`);
        params.push(endDate);
      }

      if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(" AND ")}`;
      }

      query += ` ORDER BY o.created_at DESC LIMIT $${++paramCount} OFFSET $${++paramCount}`;
      params.push(limit, offset);

      const result = await this.pool.query(query, params);

      // Get total count
      let countQuery = `
        SELECT COUNT(*) 
        FROM orders o
        LEFT JOIN customers c ON o.customer_id = c.customer_id
      `;

      if (conditions.length > 0) {
        countQuery += ` WHERE ${conditions.join(" AND ")}`;
      }

      const countResult = await this.pool.query(
        countQuery,
        params.slice(0, -2)
      );

      return {
        orders: result.rows.map((row) => Order.fromDbRowWithJoins(row)),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: parseInt(countResult.rows[0].count),
          pages: Math.ceil(countResult.rows[0].count / limit),
        },
      };
    } catch (error) {
      console.error("Error listing orders:", error);
      throw new Error("Failed to list orders");
    }
  }

  /**
   * Save new order
   * @param {Order} order Order entity to save
   * @returns {Promise<Order>} Saved order with ID
   */
  async save(order) {
    try {
      const validation = order.validate();
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
      }

      const result = await this.pool.query(
        `INSERT INTO orders (customer_id, customer_snapshot, total_amount_ht, total_amount_ttc, 
                            payment_method, notes, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
         RETURNING id, customer_id, customer_snapshot, total_amount_ht, total_amount_ttc, 
                   payment_method, notes, created_at, updated_at`,
        [
          order.customerId,
          order.customerSnapshot,
          order.totalAmountHT,
          order.totalAmountTTC,
          order.paymentMethod,
          order.notes,
        ]
      );

      return Order.fromDbRow(result.rows[0]);
    } catch (error) {
      console.error("Error saving order:", error);
      throw new Error("Failed to save order");
    }
  }

  /**
   * Update existing order
   * @param {Order} order Order entity to update
   * @returns {Promise<Order>} Updated order
   */
  async update(order) {
    try {
      const validation = order.validate();
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
      }

      const result = await this.pool.query(
        `UPDATE orders 
         SET customer_id = $1, customer_snapshot = $2, total_amount_ht = $3, 
             total_amount_ttc = $4, payment_method = $5, notes = $6, updated_at = NOW()
         WHERE id = $7
         RETURNING id, customer_id, customer_snapshot, total_amount_ht, total_amount_ttc, 
                   payment_method, notes, created_at, updated_at`,
        [
          order.customerId,
          order.customerSnapshot,
          order.totalAmountHT,
          order.totalAmountTTC,
          order.paymentMethod,
          order.notes,
          order.id,
        ]
      );

      if (result.rows.length === 0) {
        throw new Error("Order not found");
      }

      return Order.fromDbRow(result.rows[0]);
    } catch (error) {
      console.error("Error updating order:", error);
      throw new Error("Failed to update order");
    }
  }

  /**
   * Delete order
   * @param {Order} order Order entity to delete
   * @returns {Promise<boolean>} True if deleted successfully
   */
  async delete(order) {
    try {
      const result = await this.pool.query(
        "DELETE FROM orders WHERE id = $1 RETURNING id",
        [order.id]
      );

      return result.rows.length > 0;
    } catch (error) {
      console.error("Error deleting order:", error);
      throw new Error("Failed to delete order");
    }
  }

  /**
   * Get order statistics
   * @param {Object} options Statistics options
   * @returns {Promise<Object>} Order statistics
   */
  async getStatistics(options = {}) {
    try {
      const { startDate, endDate, customerId } = options;

      let query = `
        SELECT 
          COUNT(*) as total_orders,
          SUM(total_amount_ht) as total_revenue_ht,
          SUM(total_amount_ttc) as total_revenue_ttc,
          AVG(total_amount_ht) as average_order_value_ht,
          AVG(total_amount_ttc) as average_order_value_ttc
        FROM orders
      `;

      const params = [];
      let paramCount = 0;
      const conditions = [];

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

      if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(" AND ")}`;
      }

      const result = await this.pool.query(query, params);

      return {
        total: parseInt(result.rows[0].total_orders) || 0,
        totalRevenueHT: parseFloat(result.rows[0].total_revenue_ht) || 0,
        totalRevenueTTC: parseFloat(result.rows[0].total_revenue_ttc) || 0,
        averageOrderValueHT:
          parseFloat(result.rows[0].average_order_value_ht) || 0,
        averageOrderValueTTC:
          parseFloat(result.rows[0].average_order_value_ttc) || 0,
      };
    } catch (error) {
      console.error("Error getting order statistics:", error);
      throw new Error("Failed to get order statistics");
    }
  }
}

module.exports = OrderRepository;
