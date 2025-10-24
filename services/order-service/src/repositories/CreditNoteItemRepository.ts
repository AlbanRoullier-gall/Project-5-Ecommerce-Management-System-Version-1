import { Pool } from "pg";
import CreditNoteItem, { CreditNoteItemData } from "../models/CreditNoteItem";

export default class CreditNoteItemRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  /**
   * Save credit note item to database
   * @param {CreditNoteItem} item Credit note item entity
   * @returns {Promise<CreditNoteItem>} Saved credit note item
   */
  async save(item: CreditNoteItem): Promise<CreditNoteItem> {
    const query = `
      INSERT INTO credit_note_items (credit_note_id, product_id, product_name, quantity, 
                                    unit_price_ht, unit_price_ttc, vat_rate, 
                                    total_price_ht, total_price_ttc, 
                                    created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
      RETURNING id, credit_note_id, product_id, product_name, quantity, 
                unit_price_ht, unit_price_ttc, vat_rate, 
                total_price_ht, total_price_ttc, created_at, updated_at
    `;

    const values = [
      item.creditNoteId,
      item.productId,
      item.productName,
      item.quantity,
      item.unitPriceHT,
      item.unitPriceTTC,
      item.vatRate,
      item.totalPriceHT,
      item.totalPriceTTC,
    ];

    const result = await this.pool.query(query, values);
    return new CreditNoteItem(result.rows[0]);
  }

  /**
   * Update credit note item in database
   * @param {CreditNoteItem} item Credit note item entity
   * @returns {Promise<CreditNoteItem>} Updated credit note item
   */
  async update(item: CreditNoteItem): Promise<CreditNoteItem> {
    const query = `
      UPDATE credit_note_items 
      SET credit_note_id = $1, product_id = $2, product_name = $3, quantity = $4, 
          unit_price_ht = $5, unit_price_ttc = $6, vat_rate = $7, 
          total_price_ht = $8, total_price_ttc = $9
      WHERE id = $10
      RETURNING id, credit_note_id, product_id, product_name, quantity, 
                unit_price_ht, unit_price_ttc, vat_rate, 
                total_price_ht, total_price_ttc, created_at, updated_at
    `;

    const values = [
      item.creditNoteId,
      item.productId,
      item.productName,
      item.quantity,
      item.unitPriceHT,
      item.unitPriceTTC,
      item.vatRate,
      item.totalPriceHT,
      item.totalPriceTTC,
      item.id,
    ];

    const result = await this.pool.query(query, values);
    return new CreditNoteItem(result.rows[0]);
  }

  /**
   * Delete credit note item from database
   * @param {CreditNoteItem} item Credit note item entity
   * @returns {Promise<boolean>} True if deleted successfully
   */
  async delete(item: CreditNoteItem): Promise<boolean> {
    const query = "DELETE FROM credit_note_items WHERE id = $1";
    const result = await this.pool.query(query, [item.id]);
    return result.rowCount! > 0;
  }

  /**
   * Get credit note item by ID
   * @param {number} id Credit note item ID
   * @returns {Promise<CreditNoteItem|null>} Credit note item or null if not found
   */
  async getById(id: number): Promise<CreditNoteItem | null> {
    const query = `
      SELECT id, credit_note_id, product_id, product_name, quantity, 
             unit_price_ht, unit_price_ttc, vat_rate, 
             total_price_ht, total_price_ttc, created_at, updated_at
      FROM credit_note_items 
      WHERE id = $1
    `;

    const result = await this.pool.query(query, [id]);
    return result.rows.length > 0 ? new CreditNoteItem(result.rows[0]) : null;
  }

  /**
   * List credit note items by credit note
   * @param {number} creditNoteId Credit note ID
   * @returns {Promise<CreditNoteItem[]>} Array of credit note items
   */
  async listByCreditNote(creditNoteId: number): Promise<CreditNoteItem[]> {
    const query = `
      SELECT id, credit_note_id, product_id, product_name, quantity, 
             unit_price_ht, unit_price_ttc, vat_rate, 
             total_price_ht, total_price_ttc, created_at, updated_at
      FROM credit_note_items 
      WHERE credit_note_id = $1
      ORDER BY created_at
    `;

    const result = await this.pool.query(query, [creditNoteId]);
    return result.rows.map((row) => new CreditNoteItem(row));
  }

  /**
   * Delete all credit note items by credit note
   * @param {number} creditNoteId Credit note ID
   * @returns {Promise<boolean>} True if deleted successfully
   */
  async deleteAllByCreditNote(creditNoteId: number): Promise<boolean> {
    const query = "DELETE FROM credit_note_items WHERE credit_note_id = $1";
    const result = await this.pool.query(query, [creditNoteId]);
    return result.rowCount! > 0;
  }

  /**
   * Get credit note totals
   * @param {number} creditNoteId Credit note ID
   * @returns {Promise<Object>} Credit note totals
   */
  async getCreditNoteTotals(creditNoteId: number): Promise<any> {
    const query = `
      SELECT 
        COALESCE(SUM(total_price_ht), 0) as totalHT,
        COALESCE(SUM(total_price_ttc), 0) as totalTTC,
        COALESCE(SUM(total_price_ttc - total_price_ht), 0) as totalVAT
      FROM credit_note_items 
      WHERE credit_note_id = $1
    `;

    const result = await this.pool.query(query, [creditNoteId]);
    const row = result.rows[0];

    return {
      totalHT: parseFloat(row.totalht),
      totalTTC: parseFloat(row.totalttc),
      totalVAT: parseFloat(row.totalvat),
    };
  }

  /**
   * Create credit note item
   */
  async createCreditNoteItem(
    creditNoteItemData: CreditNoteItemData
  ): Promise<CreditNoteItem> {
    const query = `
      INSERT INTO credit_note_items (
        credit_note_id, product_id, product_name, quantity, unit_price_ht,
        unit_price_ttc, vat_rate, total_price_ht, total_price_ttc
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const values = [
      creditNoteItemData.credit_note_id,
      creditNoteItemData.product_id,
      // product_name is optional in model; default to null
      (creditNoteItemData as any).product_name ?? null,
      creditNoteItemData.quantity,
      creditNoteItemData.unit_price_ht,
      creditNoteItemData.unit_price_ttc,
      creditNoteItemData.vat_rate,
      creditNoteItemData.total_price_ht,
      creditNoteItemData.total_price_ttc,
    ];

    const result = await this.pool.query(query, values);
    return new CreditNoteItem(result.rows[0]);
  }

  /**
   * Get credit note item by ID
   */
  async getCreditNoteItemById(id: number): Promise<CreditNoteItem | null> {
    const query = `SELECT * FROM credit_note_items WHERE id = $1`;
    const result = await this.pool.query(query, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    return new CreditNoteItem(result.rows[0]);
  }

  /**
   * Update credit note item
   */
  async updateCreditNoteItem(
    id: number,
    creditNoteItemData: Partial<CreditNoteItemData>
  ): Promise<CreditNoteItem> {
    const fields = [];
    const values = [];
    let paramCount = 0;

    if (creditNoteItemData.credit_note_id !== undefined) {
      fields.push(`credit_note_id = $${++paramCount}`);
      values.push(creditNoteItemData.credit_note_id);
    }
    if (creditNoteItemData.product_id !== undefined) {
      fields.push(`product_id = $${++paramCount}`);
      values.push(creditNoteItemData.product_id);
    }
    if (creditNoteItemData.quantity !== undefined) {
      fields.push(`quantity = $${++paramCount}`);
      values.push(creditNoteItemData.quantity);
    }
    if (creditNoteItemData.unit_price_ht !== undefined) {
      fields.push(`unit_price_ht = $${++paramCount}`);
      values.push(creditNoteItemData.unit_price_ht);
    }
    if (creditNoteItemData.unit_price_ttc !== undefined) {
      fields.push(`unit_price_ttc = $${++paramCount}`);
      values.push(creditNoteItemData.unit_price_ttc);
    }
    if (creditNoteItemData.total_price_ht !== undefined) {
      fields.push(`total_price_ht = $${++paramCount}`);
      values.push(creditNoteItemData.total_price_ht);
    }
    if (creditNoteItemData.total_price_ttc !== undefined) {
      fields.push(`total_price_ttc = $${++paramCount}`);
      values.push(creditNoteItemData.total_price_ttc);
    }

    if (fields.length === 0) {
      throw new Error("No fields to update");
    }

    values.push(id);

    const query = `
      UPDATE credit_note_items 
      SET ${fields.join(", ")} 
      WHERE id = $${++paramCount}
      RETURNING *
    `;

    const result = await this.pool.query(query, values);
    if (result.rows.length === 0) {
      throw new Error("Credit note item not found");
    }

    return new CreditNoteItem(result.rows[0]);
  }

  /**
   * Delete credit note item
   */
  async deleteCreditNoteItem(id: number): Promise<boolean> {
    const query = `DELETE FROM credit_note_items WHERE id = $1`;
    const result = await this.pool.query(query, [id]);
    return result.rowCount! > 0;
  }

  /**
   * Get credit note items by credit note ID
   */
  async getCreditNoteItemsByCreditNoteId(
    creditNoteId: number
  ): Promise<CreditNoteItem[]> {
    const query = `
      SELECT * FROM credit_note_items 
      WHERE credit_note_id = $1 
      ORDER BY created_at
    `;

    const result = await this.pool.query(query, [creditNoteId]);
    return result.rows.map((row) => new CreditNoteItem(row));
  }

  /**
   * Récupérer les articles d'un avoir
   * @param {number} creditNoteId ID de l'avoir
   * @returns {Promise<any[]>} Liste des articles
   */
  async getItemsByCreditNoteId(creditNoteId: number): Promise<any[]> {
    try {
      const query = `
        SELECT 
          cni.id, cni.product_id as "productId", cni.product_name as "productName",
          cni.quantity, cni.unit_price_ht as "unitPriceHT", cni.unit_price_ttc as "unitPriceTTC",
          cni.total_price_ht as "totalPriceHT", cni.total_price_ttc as "totalPriceTTC"
        FROM credit_note_items cni
        WHERE cni.credit_note_id = $1
        ORDER BY cni.id
      `;

      const result = await this.pool.query(query, [creditNoteId]);
      return result.rows;
    } catch (error) {
      console.error(
        "Error getting credit note items by credit note ID:",
        error
      );
      throw error;
    }
  }
}
