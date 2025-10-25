import { Pool } from "pg";
import CreditNote, { CreditNoteData } from "../models/CreditNote";
import { OrderListOptions } from "./OrderRepository";

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
    return new CreditNote(result.rows[0]);
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
          reason = $5, description = $6, issue_date = $7, payment_method = $8, notes = $9
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
    return new CreditNote(result.rows[0]);
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
             reason, description, issue_date, payment_method, notes, COALESCE(status, 'pending') as status, created_at, updated_at
      FROM credit_notes 
      WHERE id = $1
    `;

    const result = await this.pool.query(query, [id]);
    return result.rows.length > 0 ? new CreditNote(result.rows[0]) : null;
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
             reason, description, issue_date, payment_method, notes, COALESCE(status, 'pending') as status, created_at, updated_at
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
      creditNotes: result.rows.map((row) => new CreditNote(row)),
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
             reason, description, issue_date, payment_method, notes, COALESCE(status, 'pending') as status, created_at, updated_at
      FROM credit_notes 
      WHERE customer_id = $1
      ORDER BY created_at DESC
    `;

    const result = await this.pool.query(query, [customerId]);
    return result.rows.map((row) => new CreditNote(row));
  }

  /**
   * List credit notes by order
   * @param {number} orderId Order ID
   * @returns {Promise<CreditNote[]>} Array of credit notes
   */
  async listByOrder(orderId: number): Promise<CreditNote[]> {
    const query = `
      SELECT id, customer_id, order_id, total_amount_ht, total_amount_ttc, 
             reason, description, issue_date, payment_method, notes, COALESCE(status, 'pending') as status, created_at, updated_at
      FROM credit_notes 
      WHERE order_id = $1
      ORDER BY created_at DESC
    `;

    const result = await this.pool.query(query, [orderId]);
    return result.rows.map((row) => new CreditNote(row));
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

  /**
   * Obtenir les totaux HT et TTC des avoirs (avec filtres optionnels)
   * @param {OrderListOptions} options Options de filtrage (dates, client)
   * @returns {Promise<{ totalHT: number; totalTTC: number }>} Totaux des avoirs
   */
  async getCreditNotesTotals(
    options: OrderListOptions = {}
  ): Promise<{ totalHT: number; totalTTC: number }> {
    const { startDate, endDate, customerId, year } = options;
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

    if (year) {
      conditions.push(`EXTRACT(YEAR FROM created_at) = $${++paramCount}`);
      params.push(year);
    }

    let whereClause = "";
    if (conditions.length > 0) {
      whereClause = ` WHERE ${conditions.join(" AND ")}`;
    }

    const query = `
      SELECT 
        COALESCE(SUM(total_amount_ht), 0) AS total_ht,
        COALESCE(SUM(total_amount_ttc), 0) AS total_ttc
      FROM credit_notes${whereClause}
    `;

    const result = await this.pool.query(query, params);
    const row = result.rows[0];
    return {
      totalHT: parseFloat(row.total_ht),
      totalTTC: parseFloat(row.total_ttc),
    };
  }

  /**
   * Create credit note
   */
  async createCreditNote(creditNoteData: CreditNoteData): Promise<CreditNote> {
    const query = `
      INSERT INTO credit_notes (
        customer_id, order_id, reason, description, 
        total_amount_ht, total_amount_ttc, payment_method, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const values = [
      creditNoteData.customer_id,
      creditNoteData.order_id,
      creditNoteData.reason,
      creditNoteData.description,
      creditNoteData.total_amount_ht,
      creditNoteData.total_amount_ttc,
      creditNoteData.payment_method,
      creditNoteData.notes,
    ];

    const result = await this.pool.query(query, values);
    return new CreditNote(result.rows[0]);
  }

  /**
   * Get credit note by ID
   */
  async getCreditNoteById(id: number): Promise<CreditNote | null> {
    const query = `SELECT * FROM credit_notes WHERE id = $1`;
    const result = await this.pool.query(query, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    return new CreditNote(result.rows[0]);
  }

  /**
   * Update credit note
   */
  async updateCreditNote(
    id: number,
    creditNoteData: Partial<CreditNoteData>
  ): Promise<CreditNote> {
    const fields = [];
    const values = [];
    let paramCount = 0;

    if (creditNoteData.customer_id !== undefined) {
      fields.push(`customer_id = $${++paramCount}`);
      values.push(creditNoteData.customer_id);
    }
    if (creditNoteData.order_id !== undefined) {
      fields.push(`order_id = $${++paramCount}`);
      values.push(creditNoteData.order_id);
    }
    if (creditNoteData.reason !== undefined) {
      fields.push(`reason = $${++paramCount}`);
      values.push(creditNoteData.reason);
    }
    if (creditNoteData.description !== undefined) {
      fields.push(`description = $${++paramCount}`);
      values.push(creditNoteData.description);
    }
    if (creditNoteData.total_amount_ht !== undefined) {
      fields.push(`total_amount_ht = $${++paramCount}`);
      values.push(creditNoteData.total_amount_ht);
    }
    if (creditNoteData.total_amount_ttc !== undefined) {
      fields.push(`total_amount_ttc = $${++paramCount}`);
      values.push(creditNoteData.total_amount_ttc);
    }
    if (creditNoteData.payment_method !== undefined) {
      fields.push(`payment_method = $${++paramCount}`);
      values.push(creditNoteData.payment_method);
    }
    if (creditNoteData.notes !== undefined) {
      fields.push(`notes = $${++paramCount}`);
      values.push(creditNoteData.notes);
    }

    if (fields.length === 0) {
      throw new Error("No fields to update");
    }

    values.push(id);

    const query = `
      UPDATE credit_notes 
      SET ${fields.join(", ")} 
      WHERE id = $${++paramCount}
      RETURNING *
    `;

    const result = await this.pool.query(query, values);
    if (result.rows.length === 0) {
      throw new Error("Credit note not found");
    }

    return new CreditNote(result.rows[0]);
  }

  /**
   * Update credit note status
   * @param {number} id Credit note ID
   * @param {string} status New status
   */
  async updateStatus(id: number, status: string): Promise<CreditNote> {
    const query = `
      UPDATE credit_notes
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING id, customer_id, order_id, total_amount_ht, total_amount_ttc,
                reason, description, issue_date, payment_method, notes, status, created_at, updated_at
    `;
    const result = await this.pool.query(query, [status, id]);
    if (result.rows.length === 0) {
      throw new Error(`Credit note with ID ${id} not found`);
    }
    return new CreditNote(result.rows[0]);
  }

  /**
   * Delete credit note
   */
  async deleteCreditNote(id: number): Promise<boolean> {
    const query = `DELETE FROM credit_notes WHERE id = $1`;
    const result = await this.pool.query(query, [id]);
    return result.rowCount! > 0;
  }

  /**
   * Get credit notes by customer ID
   */
  async getCreditNotesByCustomerId(customerId: number): Promise<CreditNote[]> {
    const query = `
      SELECT * FROM credit_notes 
      WHERE customer_id = $1 
      ORDER BY created_at DESC
    `;

    const result = await this.pool.query(query, [customerId]);
    return result.rows.map((row) => new CreditNote(row));
  }

  /**
   * Récupérer les avoirs par année pour l'export
   * @param {number} year Année
   * @returns {Promise<any[]>} Liste des avoirs
   */
  async getCreditNotesByYear(year: number): Promise<any[]> {
    try {
      const query = `
        SELECT 
          cn.id, cn.customer_id as "customerId", cn.order_id as "orderId",
          cn.reason, cn.description, cn.issue_date as "issueDate",
          cn.payment_method as "paymentMethod", cn.total_amount_ht as "totalAmountHT",
          cn.total_amount_ttc as "totalAmountTTC", cn.notes,
          cn.created_at as "createdAt", cn.updated_at as "updatedAt"
        FROM credit_notes cn
        WHERE EXTRACT(YEAR FROM cn.created_at) = $1
        ORDER BY cn.created_at DESC
      `;

      const result = await this.pool.query(query, [year]);
      return result.rows;
    } catch (error) {
      console.error("Error getting credit notes by year:", error);
      throw error;
    }
  }
}
