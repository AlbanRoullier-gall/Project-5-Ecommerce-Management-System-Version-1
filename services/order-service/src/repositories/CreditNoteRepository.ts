import { Pool } from "pg";
import CreditNote from "../models/CreditNote";
import { OrderListOptions } from "../types";

export default class CreditNoteRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  /**
   * Save credit note to database
   * @param {CreditNote} creditNote Credit note entity
   * @returns {Promise<CreditNote>} Saved credit note
   */
  async save(creditNote: CreditNote): Promise<CreditNote> {
    const query = `
      INSERT INTO credit_notes (customer_id, order_id, total_amount_ht, total_amount_ttc, 
                               reason, description, issue_date, payment_method, notes, 
                               created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
      RETURNING id, customer_id, order_id, total_amount_ht, total_amount_ttc, 
                reason, description, issue_date, payment_method, notes, created_at, updated_at
    `;

    const values = [
      creditNote.customerId,
      creditNote.orderId,
      creditNote.totalAmountHT,
      creditNote.totalAmountTTC,
      creditNote.reason,
      creditNote.description,
      creditNote.issueDate,
      creditNote.paymentMethod,
      creditNote.notes,
    ];

    const result = await this.pool.query(query, values);
    return CreditNote.fromDbRow(result.rows[0]);
  }

  /**
   * Update credit note in database
   * @param {CreditNote} creditNote Credit note entity
   * @returns {Promise<CreditNote>} Updated credit note
   */
  async update(creditNote: CreditNote): Promise<CreditNote> {
    const query = `
      UPDATE credit_notes 
      SET customer_id = $1, order_id = $2, total_amount_ht = $3, total_amount_ttc = $4, 
          reason = $5, description = $6, issue_date = $7, payment_method = $8, notes = $9, 
          updated_at = NOW()
      WHERE id = $10
      RETURNING id, customer_id, order_id, total_amount_ht, total_amount_ttc, 
                reason, description, issue_date, payment_method, notes, created_at, updated_at
    `;

    const values = [
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
    ];

    const result = await this.pool.query(query, values);
    return CreditNote.fromDbRow(result.rows[0]);
  }

  /**
   * Delete credit note from database
   * @param {CreditNote} creditNote Credit note entity
   * @returns {Promise<boolean>} True if deleted successfully
   */
  async delete(creditNote: CreditNote): Promise<boolean> {
    const query = "DELETE FROM credit_notes WHERE id = $1";
    const result = await this.pool.query(query, [creditNote.id]);
    return result.rowCount! > 0;
  }

  /**
   * Get credit note by ID
   * @param {number} id Credit note ID
   * @returns {Promise<CreditNote|null>} Credit note or null if not found
   */
  async getById(id: number): Promise<CreditNote | null> {
    const query = `
      SELECT id, customer_id, order_id, total_amount_ht, total_amount_ttc, 
             reason, description, issue_date, payment_method, notes, created_at, updated_at
      FROM credit_notes 
      WHERE id = $1
    `;

    const result = await this.pool.query(query, [id]);
    return result.rows.length > 0 ? CreditNote.fromDbRow(result.rows[0]) : null;
  }

  /**
   * List all credit notes with pagination and search
   * @param {Object} options Pagination and search options
   * @returns {Promise<Object>} Credit notes and pagination info
   */
  async listAll(options: OrderListOptions = {}): Promise<any> {
    const {
      page = 1,
      limit = 10,
      customerId,
      startDate,
      endDate,
      sort = "created_at DESC",
    } = options;

    const offset = (page - 1) * limit;
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

    const query = `
      SELECT id, customer_id, order_id, total_amount_ht, total_amount_ttc, 
             reason, description, issue_date, payment_method, notes, created_at, updated_at
      FROM credit_notes 
      ${whereClause}
      ORDER BY ${sort} 
      LIMIT $${++paramCount} OFFSET $${++paramCount}
    `;

    params.push(limit, offset);
    const result = await this.pool.query(query, params);

    // Get total count
    let countQuery = "SELECT COUNT(*) FROM credit_notes";
    if (conditions.length > 0) {
      countQuery += ` WHERE ${conditions.join(" AND ")}`;
    }
    const countResult = await this.pool.query(countQuery, params.slice(0, -2));

    return {
      creditNotes: result.rows.map((row) => CreditNote.fromDbRow(row)),
      pagination: {
        page,
        limit,
        total: parseInt(countResult.rows[0].count),
        pages: Math.ceil(parseInt(countResult.rows[0].count) / limit),
      },
    };
  }

  /**
   * List credit notes by customer
   * @param {number} customerId Customer ID
   * @returns {Promise<CreditNote[]>} Array of credit notes
   */
  async listByCustomer(customerId: number): Promise<CreditNote[]> {
    const query = `
      SELECT id, customer_id, order_id, total_amount_ht, total_amount_ttc, 
             reason, description, issue_date, payment_method, notes, created_at, updated_at
      FROM credit_notes 
      WHERE customer_id = $1
      ORDER BY created_at DESC
    `;

    const result = await this.pool.query(query, [customerId]);
    return result.rows.map((row) => CreditNote.fromDbRow(row));
  }

  /**
   * List credit notes by order
   * @param {number} orderId Order ID
   * @returns {Promise<CreditNote[]>} Array of credit notes
   */
  async listByOrder(orderId: number): Promise<CreditNote[]> {
    const query = `
      SELECT id, customer_id, order_id, total_amount_ht, total_amount_ttc, 
             reason, description, issue_date, payment_method, notes, created_at, updated_at
      FROM credit_notes 
      WHERE order_id = $1
      ORDER BY created_at DESC
    `;

    const result = await this.pool.query(query, [orderId]);
    return result.rows.map((row) => CreditNote.fromDbRow(row));
  }

  /**
   * Get credit note statistics
   * @param {Object} options Statistics options
   * @returns {Promise<Object>} Credit note statistics
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
      `SELECT COUNT(*) as total_credit_notes FROM credit_notes${whereClause}`,
      `SELECT COALESCE(SUM(total_amount_ttc), 0) as total_amount FROM credit_notes${whereClause}`,
    ];

    const [totalCreditNotesResult, totalAmountResult] = await Promise.all(
      queries.map((query) => this.pool.query(query, params))
    );

    return {
      totalCreditNotes: parseInt(
        totalCreditNotesResult.rows[0].total_credit_notes
      ),
      totalAmount: parseFloat(totalAmountResult.rows[0].total_amount),
    };
  }
}
