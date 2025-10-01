/**
 * Order ORM Entity
 * Represents an order with customer information and totals
 */
class Order {
  constructor(data = {}) {
    this.id = data.id || null;
    this.customerId = data.customerId || null;
    this.customerSnapshot = data.customerSnapshot || null;
    this.totalAmountHT = data.totalAmountHT || 0;
    this.totalAmountTTC = data.totalAmountTTC || 0;
    this.paymentMethod = data.paymentMethod || "";
    this.notes = data.notes || "";
    this.createdAt = data.createdAt || null;
    this.updatedAt = data.updatedAt || null;
  }

  /**
   * Calculate totals for the order
   */
  calculateTotals() {
    // This would typically calculate from order items
    // For now, we'll assume totals are provided
    return {
      totalHT: this.totalAmountHT,
      totalTTC: this.totalAmountTTC,
      totalVAT: this.totalAmountTTC - this.totalAmountHT,
    };
  }

  /**
   * Add item to order
   * @param {Object} item Order item data
   */
  addItem(item) {
    // This would typically add to a collection of items
    // Implementation depends on how items are managed
    console.log("Adding item to order:", item);
  }

  /**
   * Remove item from order
   * @param {number} itemId Item ID to remove
   */
  removeItem(itemId) {
    // This would typically remove from a collection of items
    console.log("Removing item from order:", itemId);
  }

  /**
   * Convert entity to database row format
   * @returns {Object} Database row
   */
  toDbRow() {
    return {
      id: this.id,
      customer_id: this.customerId,
      customer_snapshot: this.customerSnapshot,
      total_amount_ht: this.totalAmountHT,
      total_amount_ttc: this.totalAmountTTC,
      payment_method: this.paymentMethod,
      notes: this.notes,
      created_at: this.createdAt,
      updated_at: this.updatedAt,
    };
  }

  /**
   * Create entity from database row
   * @param {Object} row Database row
   * @returns {Order} Order instance
   */
  static fromDbRow(row) {
    return new Order({
      id: row.id,
      customerId: row.customer_id,
      customerSnapshot: row.customer_snapshot,
      totalAmountHT: row.total_amount_ht,
      totalAmountTTC: row.total_amount_ttc,
      paymentMethod: row.payment_method,
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }

  /**
   * Create entity from database row with joins
   * @param {Object} row Database row with joins
   * @returns {Order} Order instance with additional fields
   */
  static fromDbRowWithJoins(row) {
    const order = Order.fromDbRow(row);
    order.customerFirstName = row.first_name;
    order.customerLastName = row.last_name;
    order.customerEmail = row.email;
    return order;
  }

  /**
   * Convert to public DTO
   * @returns {Object} Public order data
   */
  toPublicDTO() {
    return {
      id: this.id,
      customerId: this.customerId,
      customerSnapshot: this.customerSnapshot,
      totalAmountHT: this.totalAmountHT,
      totalAmountTTC: this.totalAmountTTC,
      paymentMethod: this.paymentMethod,
      notes: this.notes,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      totals: this.calculateTotals(),
    };
  }

  /**
   * Validate entity data
   * @returns {Object} Validation result
   */
  validate() {
    const errors = [];

    if (!this.customerId) {
      errors.push("Customer ID is required");
    }

    if (this.totalAmountHT < 0) {
      errors.push("Total amount HT must be positive");
    }

    if (this.totalAmountTTC < 0) {
      errors.push("Total amount TTC must be positive");
    }

    if (this.totalAmountTTC < this.totalAmountHT) {
      errors.push("Total amount TTC must be greater than or equal to HT");
    }

    if (
      this.paymentMethod &&
      !["card", "paypal", "bank_transfer"].includes(this.paymentMethod)
    ) {
      errors.push("Payment method must be card, paypal, or bank_transfer");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

module.exports = Order;
