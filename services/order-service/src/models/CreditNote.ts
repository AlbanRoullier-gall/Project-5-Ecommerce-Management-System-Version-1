import { CreditNoteData, CreditNoteDbRow } from "../types";

/**
 * CreditNote ORM Entity
 * Represents a credit note for an order
 */
export default class CreditNote {
  public id: number | null;
  public customerId: number | null;
  public orderId: number | null;
  public totalAmountHT: number;
  public totalAmountTTC: number;
  public reason: string;
  public description: string;
  public issueDate: Date | null;
  public paymentMethod: string;
  public notes: string;
  public createdAt: Date | null;
  public updatedAt: Date | null;

  constructor(data: CreditNoteData = {} as CreditNoteData) {
    this.id = data.id ?? null;
    this.customerId = data.customerId ?? null;
    this.orderId = data.orderId ?? null;
    this.totalAmountHT = data.totalAmountHT ?? 0;
    this.totalAmountTTC = data.totalAmountTTC ?? 0;
    this.reason = data.reason ?? "";
    this.description = data.description ?? "";
    this.issueDate = data.issueDate ?? null;
    this.paymentMethod = data.paymentMethod ?? "";
    this.notes = data.notes ?? "";
    this.createdAt = data.createdAt ?? null;
    this.updatedAt = data.updatedAt ?? null;
  }

  /**
   * Calculate totals for the credit note
   */
  calculateTotals(): { totalHT: number; totalTTC: number; totalVAT: number } {
    return {
      totalHT: this.totalAmountHT,
      totalTTC: this.totalAmountTTC,
      totalVAT: this.totalAmountTTC - this.totalAmountHT,
    };
  }

  /**
   * Convert entity to database row format
   * @returns {Object} Database row
   */
  toDbRow(): CreditNoteDbRow {
    return {
      id: this.id!,
      customer_id: this.customerId!,
      order_id: this.orderId!,
      total_amount_ht: this.totalAmountHT,
      total_amount_ttc: this.totalAmountTTC,
      reason: this.reason,
      description: this.description,
      issue_date: this.issueDate!,
      payment_method: this.paymentMethod,
      notes: this.notes,
      created_at: this.createdAt!,
      updated_at: this.updatedAt!,
    };
  }

  /**
   * Create entity from database row
   * @param {Object} row Database row
   * @returns {CreditNote} CreditNote instance
   */
  static fromDbRow(row: CreditNoteDbRow): CreditNote {
    return new CreditNote({
      id: row.id,
      customerId: row.customer_id,
      orderId: row.order_id,
      totalAmountHT: row.total_amount_ht,
      totalAmountTTC: row.total_amount_ttc,
      reason: row.reason,
      description: row.description ?? "",
      issueDate: row.issue_date,
      paymentMethod: row.payment_method,
      notes: row.notes ?? "",
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }

  /**
   * Convert to public DTO
   * @returns {Object} Public credit note data
   */
  toPublicDTO(): any {
    return {
      id: this.id,
      customerId: this.customerId,
      orderId: this.orderId,
      totalAmountHT: this.totalAmountHT,
      totalAmountTTC: this.totalAmountTTC,
      reason: this.reason,
      description: this.description,
      issueDate: this.issueDate,
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
  validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.customerId) {
      errors.push("Customer ID is required");
    }

    if (!this.orderId) {
      errors.push("Order ID is required");
    }

    if (!this.reason || this.reason.trim().length === 0) {
      errors.push("Reason is required");
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

    if (this.issueDate && new Date(this.issueDate) > new Date()) {
      errors.push("Issue date cannot be in the future");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
