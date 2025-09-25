/**
 * Country ORM Entity
 * Represents countries
 */
export interface CountryData {
  countryId?: number | null;
  countryName?: string;
  createdAt?: Date | null;
}

export interface CountryDbRow {
  country_id?: number | null;
  country_name?: string;
  created_at?: Date | null;
}

export interface CountryPublicDTO {
  countryId: number | null;
  countryName: string;
  createdAt: Date | null;
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
   * Convert entity to database row format
   * @returns {Object} Database row
   */
  toDbRow(): CountryDbRow {
    return {
      country_id: this.countryId,
      country_name: this.countryName,
      created_at: this.createdAt,
    };
  }

  /**
   * Create entity from database row
   * @param {Object} row Database row
   * @returns {Country} Country instance
   */
  static fromDbRow(row: CountryDbRow): Country {
    return new Country({
      countryId: row.country_id ?? null,
      countryName: row.country_name ?? "",
      createdAt: row.created_at ?? null,
    });
  }

  /**
   * Convert to public DTO
   * @returns {Object} Public country data
   */
  toPublicDTO(): CountryPublicDTO {
    return {
      countryId: this.countryId,
      countryName: this.countryName,
      createdAt: this.createdAt,
    };
  }

  /**
   * Validate entity data
   * @returns {Object} Validation result
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
