import { Pool } from "pg";
import CreditNoteItem from "../models/CreditNoteItem";

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
      INSERT INTO credit_note_items (credit_note_id, product_id, quantity, unit_price_ht, 
                                    unit_price_ttc, vat_rate, total_price_ht, total_price_ttc, 
                                    created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
      RETURNING id, credit_note_id, product_id, quantity, unit_price_ht, unit_price_ttc, 
                vat_rate, total_price_ht, total_price_ttc, created_at, updated_at
    `;

    const values = [
      item.creditNoteId,
      item.productId,
      item.quantity,
      item.unitPriceHT,
      item.unitPriceTTC,
      item.vatRate,
      item.totalPriceHT,
      item.totalPriceTTC,
    ];

    const result = await this.pool.query(query, values);
    return CreditNoteItem.fromDbRow(result.rows[0]);
  }

  /**
   * Update credit note item in database
   * @param {CreditNoteItem} item Credit note item entity
   * @returns {Promise<CreditNoteItem>} Updated credit note item
   */
  async update(item: CreditNoteItem): Promise<CreditNoteItem> {
    const query = `
      UPDATE credit_note_items 
      SET credit_note_id = $1, product_id = $2, quantity = $3, unit_price_ht = $4, 
          unit_price_ttc = $5, vat_rate = $6, total_price_ht = $7, total_price_ttc = $8, 
          updated_at = NOW()
      WHERE id = $9
      RETURNING id, credit_note_id, product_id, quantity, unit_price_ht, unit_price_ttc, 
                vat_rate, total_price_ht, total_price_ttc, created_at, updated_at
    `;

    const values = [
      item.creditNoteId,
      item.productId,
      item.quantity,
      item.unitPriceHT,
      item.unitPriceTTC,
      item.vatRate,
      item.totalPriceHT,
      item.totalPriceTTC,
      item.id,
    ];

    const result = await this.pool.query(query, values);
    return CreditNoteItem.fromDbRow(result.rows[0]);
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
      SELECT id, credit_note_id, product_id, quantity, unit_price_ht, unit_price_ttc, 
             vat_rate, total_price_ht, total_price_ttc, created_at, updated_at
      FROM credit_note_items 
      WHERE id = $1
    `;

    const result = await this.pool.query(query, [id]);
    return result.rows.length > 0
      ? CreditNoteItem.fromDbRow(result.rows[0])
      : null;
  }

  /**
   * List credit note items by credit note
   * @param {number} creditNoteId Credit note ID
   * @returns {Promise<CreditNoteItem[]>} Array of credit note items
   */
  async listByCreditNote(creditNoteId: number): Promise<CreditNoteItem[]> {
    const query = `
      SELECT id, credit_note_id, product_id, quantity, unit_price_ht, unit_price_ttc, 
             vat_rate, total_price_ht, total_price_ttc, created_at, updated_at
      FROM credit_note_items 
      WHERE credit_note_id = $1
      ORDER BY created_at
    `;

    const result = await this.pool.query(query, [creditNoteId]);
    return result.rows.map((row) => CreditNoteItem.fromDbRow(row));
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
}
