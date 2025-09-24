/**
 * CreditNoteItemRepository
 * Handles database operations for CreditNoteItem entities
 */
const CreditNoteItem = require("../models/CreditNoteItem");

class CreditNoteItemRepository {
  constructor(pool) {
    this.pool = pool;
  }

  /**
   * Get credit note item by ID
   * @param {number} id Item ID
   * @returns {Promise<CreditNoteItem|null>} CreditNoteItem or null if not found
   */
  async getById(id) {
    try {
      const result = await this.pool.query(
        `SELECT id, credit_note_id, product_id, quantity, unit_price_ht, unit_price_ttc, 
                vat_rate, total_price_ht, total_price_ttc, created_at, updated_at
         FROM credit_note_items 
         WHERE id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return CreditNoteItem.fromDbRow(result.rows[0]);
    } catch (error) {
      console.error("Error getting credit note item by ID:", error);
      throw new Error("Failed to retrieve credit note item");
    }
  }

  /**
   * List items by credit note ID
   * @param {number} creditNoteId Credit note ID
   * @returns {Promise<CreditNoteItem[]>} Array of credit note items
   */
  async listByCreditNote(creditNoteId) {
    try {
      const result = await this.pool.query(
        `SELECT id, credit_note_id, product_id, quantity, unit_price_ht, unit_price_ttc, 
                vat_rate, total_price_ht, total_price_ttc, created_at, updated_at
         FROM credit_note_items 
         WHERE credit_note_id = $1
         ORDER BY created_at`,
        [creditNoteId]
      );

      return result.rows.map((row) => CreditNoteItem.fromDbRow(row));
    } catch (error) {
      console.error("Error listing credit note items:", error);
      throw new Error("Failed to retrieve credit note items");
    }
  }

  /**
   * Save new credit note item
   * @param {CreditNoteItem} item CreditNoteItem entity to save
   * @returns {Promise<CreditNoteItem>} Saved item with ID
   */
  async save(item) {
    try {
      const validation = item.validate();
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
      }

      const result = await this.pool.query(
        `INSERT INTO credit_note_items (credit_note_id, product_id, quantity, unit_price_ht, 
                                        unit_price_ttc, vat_rate, total_price_ht, total_price_ttc, 
                                        created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
         RETURNING id, credit_note_id, product_id, quantity, unit_price_ht, unit_price_ttc, 
                   vat_rate, total_price_ht, total_price_ttc, created_at, updated_at`,
        [
          item.creditNoteId,
          item.productId,
          item.quantity,
          item.unitPriceHT,
          item.unitPriceTTC,
          item.vatRate,
          item.totalPriceHT,
          item.totalPriceTTC,
        ]
      );

      return CreditNoteItem.fromDbRow(result.rows[0]);
    } catch (error) {
      console.error("Error saving credit note item:", error);
      throw new Error("Failed to save credit note item");
    }
  }

  /**
   * Update existing credit note item
   * @param {CreditNoteItem} item CreditNoteItem entity to update
   * @returns {Promise<CreditNoteItem>} Updated item
   */
  async update(item) {
    try {
      const validation = item.validate();
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
      }

      const result = await this.pool.query(
        `UPDATE credit_note_items 
         SET credit_note_id = $1, product_id = $2, quantity = $3, unit_price_ht = $4, 
             unit_price_ttc = $5, vat_rate = $6, total_price_ht = $7, total_price_ttc = $8, 
             updated_at = NOW()
         WHERE id = $9
         RETURNING id, credit_note_id, product_id, quantity, unit_price_ht, unit_price_ttc, 
                   vat_rate, total_price_ht, total_price_ttc, created_at, updated_at`,
        [
          item.creditNoteId,
          item.productId,
          item.quantity,
          item.unitPriceHT,
          item.unitPriceTTC,
          item.vatRate,
          item.totalPriceHT,
          item.totalPriceTTC,
          item.id,
        ]
      );

      if (result.rows.length === 0) {
        throw new Error("Credit note item not found");
      }

      return CreditNoteItem.fromDbRow(result.rows[0]);
    } catch (error) {
      console.error("Error updating credit note item:", error);
      throw new Error("Failed to update credit note item");
    }
  }

  /**
   * Delete credit note item
   * @param {CreditNoteItem} item CreditNoteItem entity to delete
   * @returns {Promise<boolean>} True if deleted successfully
   */
  async delete(item) {
    try {
      const result = await this.pool.query(
        "DELETE FROM credit_note_items WHERE id = $1 RETURNING id",
        [item.id]
      );

      return result.rows.length > 0;
    } catch (error) {
      console.error("Error deleting credit note item:", error);
      throw new Error("Failed to delete credit note item");
    }
  }

  /**
   * Delete all items for a credit note
   * @param {number} creditNoteId Credit note ID
   * @returns {Promise<number>} Number of items deleted
   */
  async deleteAllByCreditNote(creditNoteId) {
    try {
      const result = await this.pool.query(
        "DELETE FROM credit_note_items WHERE credit_note_id = $1 RETURNING id",
        [creditNoteId]
      );

      return result.rows.length;
    } catch (error) {
      console.error("Error deleting credit note items:", error);
      throw new Error("Failed to delete credit note items");
    }
  }

  /**
   * Count items for credit note
   * @param {number} creditNoteId Credit note ID
   * @returns {Promise<number>} Number of items
   */
  async countByCreditNote(creditNoteId) {
    try {
      const result = await this.pool.query(
        "SELECT COUNT(*) FROM credit_note_items WHERE credit_note_id = $1",
        [creditNoteId]
      );

      return parseInt(result.rows[0].count);
    } catch (error) {
      console.error("Error counting credit note items:", error);
      throw new Error("Failed to count credit note items");
    }
  }

  /**
   * Get credit note totals
   * @param {number} creditNoteId Credit note ID
   * @returns {Promise<Object>} Credit note totals
   */
  async getCreditNoteTotals(creditNoteId) {
    try {
      const result = await this.pool.query(
        `SELECT 
          SUM(total_price_ht) as total_ht,
          SUM(total_price_ttc) as total_ttc,
          SUM(total_price_ttc - total_price_ht) as total_vat
         FROM credit_note_items 
         WHERE credit_note_id = $1`,
        [creditNoteId]
      );

      return {
        totalHT: parseFloat(result.rows[0].total_ht) || 0,
        totalTTC: parseFloat(result.rows[0].total_ttc) || 0,
        totalVAT: parseFloat(result.rows[0].total_vat) || 0,
      };
    } catch (error) {
      console.error("Error getting credit note totals:", error);
      throw new Error("Failed to get credit note totals");
    }
  }
}

module.exports = CreditNoteItemRepository;
