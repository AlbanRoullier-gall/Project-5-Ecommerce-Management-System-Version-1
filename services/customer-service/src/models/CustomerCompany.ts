/**
 * CustomerCompany ORM Entity
 * Represents a company associated with a customer
 */
export interface CustomerCompanyData {
  companyId?: number | null;
  customerId?: number | null;
  companyName?: string;
  siretNumber?: string;
  vatNumber?: string;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

export interface CustomerCompanyDbRow {
  company_id?: number | null;
  customer_id?: number | null;
  company_name?: string;
  siret_number?: string;
  vat_number?: string;
  created_at?: Date | null;
  updated_at?: Date | null;
}

export interface CustomerCompanyPublicDTO {
  companyId: number | null;
  customerId: number | null;
  companyName: string;
  siretNumber: string;
  vatNumber: string;
  createdAt: Date | null;
  updatedAt: Date | null;
  companyInfo: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

class CustomerCompany {
  public companyId: number | null;
  public customerId: number | null;
  public companyName: string;
  public siretNumber: string;
  public vatNumber: string;
  public createdAt: Date | null;
  public updatedAt: Date | null;

  constructor(data: CustomerCompanyData = {}) {
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
  getCompanyInfo(): string {
    const parts = [this.companyName];
    if (this.siretNumber) parts.push(`SIRET: ${this.siretNumber}`);
    if (this.vatNumber) parts.push(`TVA: ${this.vatNumber}`);
    return parts.join(" - ");
  }

  /**
   * Convert entity to database row format
   * @returns {Object} Database row
   */
  toDbRow(): CustomerCompanyDbRow {
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
  static fromDbRow(row: CustomerCompanyDbRow): CustomerCompany {
    return new CustomerCompany({
      companyId: row.company_id ?? null,
      customerId: row.customer_id ?? null,
      companyName: row.company_name ?? "",
      siretNumber: row.siret_number ?? "",
      vatNumber: row.vat_number ?? "",
      createdAt: row.created_at ?? null,
      updatedAt: row.updated_at ?? null,
    });
  }

  /**
   * Convert to public DTO
   * @returns {Object} Public company data
   */
  toPublicDTO(): CustomerCompanyPublicDTO {
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
  validate(): ValidationResult {
    const errors: string[] = [];

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
  static validateSiret(siret: string): boolean {
    if (!siret) return true; // Optional field

    const cleanSiret = siret.replace(/\s/g, "");
    return /^\d{14}$/.test(cleanSiret);
  }

  /**
   * Validate VAT number format
   * @param {string} vat VAT number
   * @returns {boolean} True if valid
   */
  static validateVat(vat: string): boolean {
    if (!vat) return true; // Optional field

    const cleanVat = vat.replace(/\s/g, "");
    return /^[A-Z]{2}[A-Z0-9]{2,12}$/.test(cleanVat);
  }
}

export default CustomerCompany;
