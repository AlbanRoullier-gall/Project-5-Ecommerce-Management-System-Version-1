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

// CustomerCompanyPublicDTO moved to /api/dto/CompanyDTO.ts

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
