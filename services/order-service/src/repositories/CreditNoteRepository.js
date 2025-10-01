/**
 * CreditNoteRepository
 * Handles database operations for CreditNote entities
 */
const CreditNote = require("../models/CreditNote");

class CreditNoteRepository {
  constructor(pool) {
    this.pool = pool;
  }

  /**
   * Get credit note by ID
   * @param {number} id Credit note ID
   * @returns {Promise<CreditNote|null>} CreditNote or null if not found
   */
  async getById(id) {
    try {
      const result = await this.pool.query(
        `SELECT id, customer_id, order_id, total_amount_ht, total_amount_ttc, 
                reason, description, issue_date, payment_method, notes, created_at, updated_at
         FROM credit_notes 
         WHERE id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return CreditNote.fromDbRow(result.rows[0]);
    } catch (error) {
      console.error("Error getting credit note by ID:", error);
      throw new Error("Failed to retrieve credit note");
    }
  }

  /**
   * List credit notes by customer
   * @param {number} customerId Customer ID
   * @returns {Promise<CreditNote[]>} Array of credit notes
   */
  async listByCustomer(customerId) {
    try {
      const result = await this.pool.query(
        `SELECT id, customer_id, order_id, total_amount_ht, total_amount_ttc, 
                reason, description, issue_date, payment_method, notes, created_at, updated_at
         FROM credit_notes 
         WHERE customer_id = $1
         ORDER BY created_at DESC`,
        [customerId]
      );

      return result.rows.map((row) => CreditNote.fromDbRow(row));
    } catch (error) {
      console.error("Error listing credit notes by customer:", error);
      throw new Error("Failed to retrieve credit notes");
    }
  }

  /**
   * List credit notes by order
   * @param {number} orderId Order ID
   * @returns {Promise<CreditNote[]>} Array of credit notes
   */
  async listByOrder(orderId) {
    try {
      const result = await this.pool.query(
        `SELECT id, customer_id, order_id, total_amount_ht, total_amount_ttc, 
                reason, description, issue_date, payment_method, notes, created_at, updated_at
         FROM credit_notes 
         WHERE order_id = $1
         ORDER BY created_at DESC`,
        [orderId]
      );

      return result.rows.map((row) => CreditNote.fromDbRow(row));
    } catch (error) {
      console.error("Error listing credit notes by order:", error);
      throw new Error("Failed to retrieve credit notes");
    }
  }

  /**
   * List all credit notes with pagination and search
   * @param {Object} options Pagination and search options
   * @returns {Promise<Object>} Credit notes and pagination info
   */
  async listAll(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        search = "",
        customerId,
        orderId,
        startDate,
        endDate,
      } = options;
      const offset = (page - 1) * limit;

      let query = `
        SELECT id, customer_id, order_id, total_amount_ht, total_amount_ttc, 
               reason, description, issue_date, payment_method, notes, created_at, updated_at
        FROM credit_notes
      `;

      const params = [];
      let paramCount = 0;
      const conditions = [];

      if (customerId) {
        conditions.push(`customer_id = $${++paramCount}`);
        params.push(customerId);
      }

      if (orderId) {
        conditions.push(`order_id = $${++paramCount}`);
        params.push(orderId);
      }

      if (search) {
        conditions.push(
          `(reason ILIKE $${++paramCount} OR description ILIKE $${paramCount})`
        );
        params.push(`%${search}%`);
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

      query += ` ORDER BY created_at DESC LIMIT $${++paramCount} OFFSET $${++paramCount}`;
      params.push(limit, offset);

      const result = await this.pool.query(query, params);

      // Get total count
      let countQuery = "SELECT COUNT(*) FROM credit_notes";

      if (conditions.length > 0) {
        countQuery += ` WHERE ${conditions.join(" AND ")}`;
      }

      const countResult = await this.pool.query(
        countQuery,
        params.slice(0, -2)
      );

      return {
        creditNotes: result.rows.map((row) => CreditNote.fromDbRow(row)),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: parseInt(countResult.rows[0].count),
          pages: Math.ceil(countResult.rows[0].count / limit),
        },
      };
    } catch (error) {
      console.error("Error listing credit notes:", error);
      throw new Error("Failed to list credit notes");
    }
  }

  /**
   * Save new credit note
   * @param {CreditNote} creditNote CreditNote entity to save
   * @returns {Promise<CreditNote>} Saved credit note with ID
   */
  async save(creditNote) {
    try {
      const validation = creditNote.validate();
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
      }

      const result = await this.pool.query(
        `INSERT INTO credit_notes (customer_id, order_id, total_amount_ht, total_amount_ttc, 
                                  reason, description, issue_date, payment_method, notes, 
                                  created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
         RETURNING id, customer_id, order_id, total_amount_ht, total_amount_ttc, 
                   reason, description, issue_date, payment_method, notes, created_at, updated_at`,
        [
          creditNote.customerId,
          creditNote.orderId,
          creditNote.totalAmountHT,
          creditNote.totalAmountTTC,
          creditNote.reason,
          creditNote.description,
          creditNote.issueDate,
          creditNote.paymentMethod,
          creditNote.notes,
        ]
      );

      return CreditNote.fromDbRow(result.rows[0]);
    } catch (error) {
      console.error("Error saving credit note:", error);
      throw new Error("Failed to save credit note");
    }
  }

  /**
   * Update existing credit note
   * @param {CreditNote} creditNote CreditNote entity to update
   * @returns {Promise<CreditNote>} Updated credit note
   */
  async update(creditNote) {
    try {
      const validation = creditNote.validate();
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
      }

      const result = await this.pool.query(
        `UPDATE credit_notes 
         SET customer_id = $1, order_id = $2, total_amount_ht = $3, total_amount_ttc = $4, 
             reason = $5, description = $6, issue_date = $7, payment_method = $8, notes = $9, 
             updated_at = NOW()
         WHERE id = $10
         RETURNING id, customer_id, order_id, total_amount_ht, total_amount_ttc, 
                   reason, description, issue_date, payment_method, notes, created_at, updated_at`,
        [
          creditNote.customerId,
          creditNote.orderId,
          creditNote.totalAmountHT,
          creditNote.totalAmountTTC,
          creditNote.reason,
          creditNote.description,
          creditNote.issueDate,
          creditNote.paymentMethod,
          creditNote.notes,
          creditNote.id,
        ]
      );

      if (result.rows.length === 0) {
        throw new Error("Credit note not found");
      }

      return CreditNote.fromDbRow(result.rows[0]);
    } catch (error) {
      console.error("Error updating credit note:", error);
      throw new Error("Failed to update credit note");
    }
  }

  /**
   * Delete credit note
   * @param {CreditNote} creditNote CreditNote entity to delete
   * @returns {Promise<boolean>} True if deleted successfully
   */
  async delete(creditNote) {
    try {
      const result = await this.pool.query(
        "DELETE FROM credit_notes WHERE id = $1 RETURNING id",
        [creditNote.id]
      );

      return result.rows.length > 0;
    } catch (error) {
      console.error("Error deleting credit note:", error);
      throw new Error("Failed to delete credit note");
    }
  }

  /**
   * Get credit note statistics
   * @param {Object} options Statistics options
   * @returns {Promise<Object>} Credit note statistics
   */
  async getStatistics(options = {}) {
    try {
      const { startDate, endDate, customerId } = options;

      let query = `
        SELECT 
          COUNT(*) as total_credit_notes,
          SUM(total_amount_ht) as total_amount_ht,
          SUM(total_amount_ttc) as total_amount_ttc,
          AVG(total_amount_ht) as average_amount_ht,
          AVG(total_amount_ttc) as average_amount_ttc
        FROM credit_notes
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
        totalCreditNotes: parseInt(result.rows[0].total_credit_notes) || 0,
        totalAmountHT: parseFloat(result.rows[0].total_amount_ht) || 0,
        totalAmountTTC: parseFloat(result.rows[0].total_amount_ttc) || 0,
        averageAmountHT: parseFloat(result.rows[0].average_amount_ht) || 0,
        averageAmountTTC: parseFloat(result.rows[0].average_amount_ttc) || 0,
      };
    } catch (error) {
      console.error("Error getting credit note statistics:", error);
      throw new Error("Failed to get credit note statistics");
    }
  }
}

module.exports = CreditNoteRepository;
