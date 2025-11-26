/**
 * Entité ORM CustomerCompany
 * Représente une entreprise associée à un client
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

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

class CustomerCompany {
  public companyId: number | null;
  public customerId: number | null;
  public companyName: string;
  public siretNumber: string | null;
  public vatNumber: string | null;
  public createdAt: Date | null;
  public updatedAt: Date | null;

  constructor(data: CustomerCompanyData = {}) {
    this.companyId = data.companyId || null;
    this.customerId = data.customerId || null;
    this.companyName = data.companyName || "";
    this.siretNumber = data.siretNumber || null;
    this.vatNumber = data.vatNumber || null;
    this.createdAt = data.createdAt || null;
    this.updatedAt = data.updatedAt || null;
  }

  /**
   * Obtenir les informations de l'entreprise sous forme de chaîne formatée
   * @returns {string} Informations d'entreprise formatées
   */
  getCompanyInfo(): string {
    const parts = [this.companyName];
    if (this.siretNumber && this.siretNumber.trim())
      parts.push(`SIRET: ${this.siretNumber}`);
    if (this.vatNumber && this.vatNumber.trim())
      parts.push(`TVA: ${this.vatNumber}`);
    return parts.join(" - ");
  }

  /**
   * Valider les données de l'entité
   * @returns {Object} Résultat de validation
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
   * Valider le format du numéro SIRET
   * @param {string} siret Numéro SIRET
   * @returns {boolean} True si valide
   */
  static validateSiret(siret: string): boolean {
    if (!siret) return true; // Champ optionnel

    const cleanSiret = siret.replace(/\s/g, "");
    return /^\d{14}$/.test(cleanSiret);
  }

  /**
   * Valider le format du numéro de TVA
   * @param {string} vat Numéro de TVA
   * @returns {boolean} True si valide
   */
  static validateVat(vat: string): boolean {
    if (!vat) return true; // Champ optionnel

    const cleanVat = vat.replace(/\s/g, "");
    return /^[A-Z]{2}[A-Z0-9]{2,12}$/.test(cleanVat);
  }
}

export default CustomerCompany;
