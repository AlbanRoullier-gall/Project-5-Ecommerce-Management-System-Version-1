/**
 * CustomerCompany ORM Entity
 * Represents a company associated with a customer
 */
class CustomerCompany {
  constructor(data = {}) {
    this.companyId = data.companyId || null;
    this.customerId = data.customerId || null;
    this.companyName = data.companyName || "";
    this.siretNumber = data.siretNumber || "";
    this.vatNumber = data.vatNumber || "";
    this.createdAt = data.createdAt || null;
    this.updatedAt = data.updatedAt || null;
  }

  /**
   * Get company information as a formatted string
   * @returns {string} Formatted company info
   */
  getCompanyInfo() {
    const parts = [this.companyName];
    if (this.siretNumber) parts.push(`SIRET: ${this.siretNumber}`);
    if (this.vatNumber) parts.push(`TVA: ${this.vatNumber}`);
    return parts.join(" - ");
  }

  /**
   * Convert entity to database row format
   * @returns {Object} Database row
   */
  toDbRow() {
    return {
      company_id: this.companyId,
      customer_id: this.customerId,
      company_name: this.companyName,
      siret_number: this.siretNumber,
      vat_number: this.vatNumber,
      created_at: this.createdAt,
      updated_at: this.updatedAt,
    };
  }

  /**
   * Create entity from database row
   * @param {Object} row Database row
   * @returns {CustomerCompany} CustomerCompany instance
   */
  static fromDbRow(row) {
    return new CustomerCompany({
      companyId: row.company_id,
      customerId: row.customer_id,
      companyName: row.company_name,
      siretNumber: row.siret_number,
      vatNumber: row.vat_number,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }

  /**
   * Convert to public DTO
   * @returns {Object} Public company data
   */
  toPublicDTO() {
    return {
      companyId: this.companyId,
      customerId: this.customerId,
      companyName: this.companyName,
      siretNumber: this.siretNumber,
      vatNumber: this.vatNumber,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      companyInfo: this.getCompanyInfo(),
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

    if (!this.companyName || this.companyName.trim().length === 0) {
      errors.push("Company name is required");
    }

    if (
      this.siretNumber &&
      !/^\d{14}$/.test(this.siretNumber.replace(/\s/g, ""))
    ) {
      errors.push("SIRET number must be 14 digits");
    }

    if (
      this.vatNumber &&
      !/^[A-Z]{2}[A-Z0-9]{2,12}$/.test(this.vatNumber.replace(/\s/g, ""))
    ) {
      errors.push("VAT number format is invalid (e.g., FR12345678901)");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate SIRET number format
   * @param {string} siret SIRET number
   * @returns {boolean} True if valid
   */
  static validateSiret(siret) {
    if (!siret) return true; // Optional field

    const cleanSiret = siret.replace(/\s/g, "");
    return /^\d{14}$/.test(cleanSiret);
  }

  /**
   * Validate VAT number format
   * @param {string} vat VAT number
   * @returns {boolean} True if valid
   */
  static validateVat(vat) {
    if (!vat) return true; // Optional field

    const cleanVat = vat.replace(/\s/g, "");
    return /^[A-Z]{2}[A-Z0-9]{2,12}$/.test(cleanVat);
  }
}

module.exports = CustomerCompany;
