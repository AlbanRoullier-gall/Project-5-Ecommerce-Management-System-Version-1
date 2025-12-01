import { Pool } from "pg";
import CreditNote, { CreditNoteData } from "../models/CreditNote";
import { OrderListOptions } from "./OrderRepository";

export default class CreditNoteRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  /**
   * Lister tous les avoirs avec pagination et recherche
   * @param {Object} options Options de pagination et recherche
   * @returns {Promise<Object>} Avoirs et informations de pagination
   */
  async listAll(options: OrderListOptions = {}): Promise<any> {
    const {
      page = 1,
      limit = 10,
      customerId,
      year,
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

    if (year) {
      conditions.push(`EXTRACT(YEAR FROM created_at) = $${++paramCount}`);
      params.push(year);
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

    // Obtenir le nombre total
    let countQuery = "SELECT COUNT(*) FROM credit_notes";
    if (conditions.length > 0) {
      countQuery += ` WHERE ${conditions.join(" AND ")}`;
    }
    const countResult = await this.pool.query(countQuery, params.slice(0, -2));

    const total = parseInt(countResult.rows[0].count);
    const pages = Math.ceil(total / limit);
    const hasMore = page < pages;

    return {
      creditNotes: result.rows.map((row) => new CreditNote(row)),
      pagination: {
        page,
        limit,
        total,
        pages,
        hasMore, // Indique s'il y a une page suivante
      },
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
   * Créer un avoir
   * @param {CreditNoteData} creditNoteData Données de l'avoir
   * @param {any} client Client de transaction optionnel (pour les transactions)
   */
  async createCreditNote(
    creditNoteData: CreditNoteData,
    client?: any
  ): Promise<CreditNote> {
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

    const executor = client || this.pool;
    const result = await executor.query(query, values);
    return new CreditNote(result.rows[0]);
  }

  /**
   * Obtenir un avoir par ID
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
   * Mettre à jour le statut d'un avoir
   * @param {number} id ID de l'avoir
   * @param {string} status Nouveau statut
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
   * Supprimer un avoir
   */
  async deleteCreditNote(id: number): Promise<boolean> {
    const query = `DELETE FROM credit_notes WHERE id = $1`;
    const result = await this.pool.query(query, [id]);
    return result.rowCount! > 0;
  }

  /**
   * Obtenir les avoirs par ID client
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
      // Utiliser une comparaison de dates pour être plus robuste avec les timezones
      const startOfYear = `${year}-01-01 00:00:00`;
      const endOfYear = `${year + 1}-01-01 00:00:00`;
      const query = `
        SELECT 
          cn.id, cn.customer_id as "customerId", cn.order_id as "orderId",
          cn.reason, cn.description, cn.issue_date as "issueDate",
          cn.payment_method as "paymentMethod", cn.total_amount_ht as "totalAmountHT",
          cn.total_amount_ttc as "totalAmountTTC", cn.notes,
          cn.created_at as "createdAt", cn.updated_at as "updatedAt"
        FROM credit_notes cn
        WHERE cn.created_at >= $1::timestamp 
          AND cn.created_at < $2::timestamp
        ORDER BY cn.created_at DESC
      `;

      const result = await this.pool.query(query, [startOfYear, endOfYear]);
      console.log(
        `📊 Avoirs récupérés: ${result.rows.length} avoirs pour l'année ${year}`
      );
      return result.rows;
    } catch (error) {
      console.error("Error getting credit notes by year:", error);
      throw error;
    }
  }
}
