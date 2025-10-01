/**
 * Civility ORM Entity
 * Represents civility titles (Mr, Mrs, etc.)
 */
class Civility {
  constructor(data = {}) {
    this.civilityId = data.civilityId || null;
    this.abbreviation = data.abbreviation || "";
    this.createdAt = data.createdAt || null;
  }

  /**
   * Convert entity to database row format
   * @returns {Object} Database row
   */
  toDbRow() {
    return {
      civility_id: this.civilityId,
      abbreviation: this.abbreviation,
      created_at: this.createdAt,
    };
  }

  /**
   * Create entity from database row
   * @param {Object} row Database row
   * @returns {Civility} Civility instance
   */
  static fromDbRow(row) {
    return new Civility({
      civilityId: row.civility_id,
      abbreviation: row.abbreviation,
      createdAt: row.created_at,
    });
  }

  /**
   * Convert to public DTO
   * @returns {Object} Public civility data
   */
  toPublicDTO() {
    return {
      civilityId: this.civilityId,
      abbreviation: this.abbreviation,
      createdAt: this.createdAt,
    };
  }

  /**
   * Validate entity data
   * @returns {Object} Validation result
   */
  validate() {
    const errors = [];

    if (!this.abbreviation || this.abbreviation.trim().length === 0) {
      errors.push("Abbreviation is required");
    }

    if (this.abbreviation && this.abbreviation.length > 10) {
      errors.push("Abbreviation must be 10 characters or less");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

module.exports = Civility;
