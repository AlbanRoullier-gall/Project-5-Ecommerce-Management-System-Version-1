/**
 * CreditNoteItem ORM Entity
 * Represents an item within a credit note
 */
class CreditNoteItem {
  constructor(data = {}) {
    this.id = data.id || null;
    this.creditNoteId = data.creditNoteId || null;
    this.productId = data.productId || null;
    this.quantity = data.quantity || 0;
    this.unitPriceHT = data.unitPriceHT || 0;
    this.unitPriceTTC = data.unitPriceTTC || 0;
    this.vatRate = data.vatRate || 0;
    this.totalPriceHT = data.totalPriceHT || 0;
    this.totalPriceTTC = data.totalPriceTTC || 0;
    this.createdAt = data.createdAt || null;
    this.updatedAt = data.updatedAt || null;
  }

  /**
   * Calculate item total
   */
  calculateItemTotal() {
    this.totalPriceHT = this.unitPriceHT * this.quantity;
    this.totalPriceTTC = this.unitPriceTTC * this.quantity;
    return {
      totalHT: this.totalPriceHT,
      totalTTC: this.totalPriceTTC,
      totalVAT: this.totalPriceTTC - this.totalPriceHT,
    };
  }

  /**
   * Convert entity to database row format
   * @returns {Object} Database row
   */
  toDbRow() {
    return {
      id: this.id,
      credit_note_id: this.creditNoteId,
      product_id: this.productId,
      quantity: this.quantity,
      unit_price_ht: this.unitPriceHT,
      unit_price_ttc: this.unitPriceTTC,
      vat_rate: this.vatRate,
      total_price_ht: this.totalPriceHT,
      total_price_ttc: this.totalPriceTTC,
      created_at: this.createdAt,
      updated_at: this.updatedAt,
    };
  }

  /**
   * Create entity from database row
   * @param {Object} row Database row
   * @returns {CreditNoteItem} CreditNoteItem instance
   */
  static fromDbRow(row) {
    return new CreditNoteItem({
      id: row.id,
      creditNoteId: row.credit_note_id,
      productId: row.product_id,
      quantity: row.quantity,
      unitPriceHT: row.unit_price_ht,
      unitPriceTTC: row.unit_price_ttc,
      vatRate: row.vat_rate,
      totalPriceHT: row.total_price_ht,
      totalPriceTTC: row.total_price_ttc,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }

  /**
   * Convert to public DTO
   * @returns {Object} Public item data
   */
  toPublicDTO() {
    return {
      id: this.id,
      creditNoteId: this.creditNoteId,
      productId: this.productId,
      quantity: this.quantity,
      unitPriceHT: this.unitPriceHT,
      unitPriceTTC: this.unitPriceTTC,
      vatRate: this.vatRate,
      totalPriceHT: this.totalPriceHT,
      totalPriceTTC: this.totalPriceTTC,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      totals: this.calculateItemTotal(),
    };
  }

  /**
   * Validate entity data
   * @returns {Object} Validation result
   */
  validate() {
    const errors = [];

    if (!this.creditNoteId) {
      errors.push("Credit note ID is required");
    }

    if (!this.productId) {
      errors.push("Product ID is required");
    }

    if (this.quantity <= 0) {
      errors.push("Quantity must be positive");
    }

    if (this.unitPriceHT < 0) {
      errors.push("Unit price HT must be positive");
    }

    if (this.unitPriceTTC < 0) {
      errors.push("Unit price TTC must be positive");
    }

    if (this.vatRate < 0 || this.vatRate > 100) {
      errors.push("VAT rate must be between 0 and 100");
    }

    if (this.totalPriceHT < 0) {
      errors.push("Total price HT must be positive");
    }

    if (this.totalPriceTTC < 0) {
      errors.push("Total price TTC must be positive");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

module.exports = CreditNoteItem;
