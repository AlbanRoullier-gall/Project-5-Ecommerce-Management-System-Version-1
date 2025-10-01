/**
 * Country ORM Entity
 * Represents countries
 */
class Country {
  constructor(data = {}) {
    this.countryId = data.countryId || null;
    this.countryName = data.countryName || "";
    this.createdAt = data.createdAt || null;
  }

  /**
   * Convert entity to database row format
   * @returns {Object} Database row
   */
  toDbRow() {
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
  static fromDbRow(row) {
    return new Country({
      countryId: row.country_id,
      countryName: row.country_name,
      createdAt: row.created_at,
    });
  }

  /**
   * Convert to public DTO
   * @returns {Object} Public country data
   */
  toPublicDTO() {
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
  validate() {
    const errors = [];

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

module.exports = Country;
