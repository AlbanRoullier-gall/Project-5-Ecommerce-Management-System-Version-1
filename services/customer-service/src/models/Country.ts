/**
 * Entité ORM Country
 * Représente les pays
 */
export interface CountryData {
  countryId?: number | null;
  countryName?: string;
  createdAt?: Date | null;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

class Country {
  public countryId: number | null;
  public countryName: string;
  public createdAt: Date | null;

  constructor(data: CountryData = {}) {
    this.countryId = data.countryId || null;
    this.countryName = data.countryName || "";
    this.createdAt = data.createdAt || null;
  }

  /**
   * Valider les données de l'entité
   * @returns {Object} Résultat de validation
   */
  validate(): ValidationResult {
    const errors: string[] = [];

    if (!this.countryName || this.countryName.trim().length === 0) {
      errors.push("Country name is required");
    }

    if (this.countryName && this.countryName.length > 100) {
      errors.push("Country name must be 100 characters or less");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

export default Country;
