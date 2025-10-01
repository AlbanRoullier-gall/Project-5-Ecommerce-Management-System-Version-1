/**
 * SocioProfessionalCategory ORM Entity
 * Represents socio-professional categories
 */
class SocioProfessionalCategory {
  constructor(data = {}) {
    this.categoryId = data.categoryId || null;
    this.categoryName = data.categoryName || "";
    this.createdAt = data.createdAt || null;
  }

  /**
   * Convert entity to database row format
   * @returns {Object} Database row
   */
  toDbRow() {
    return {
      category_id: this.categoryId,
      category_name: this.categoryName,
      created_at: this.createdAt,
    };
  }

  /**
   * Create entity from database row
   * @param {Object} row Database row
   * @returns {SocioProfessionalCategory} SocioProfessionalCategory instance
   */
  static fromDbRow(row) {
    return new SocioProfessionalCategory({
      categoryId: row.category_id,
      categoryName: row.category_name,
      createdAt: row.created_at,
    });
  }

  /**
   * Convert to public DTO
   * @returns {Object} Public category data
   */
  toPublicDTO() {
    return {
      categoryId: this.categoryId,
      categoryName: this.categoryName,
      createdAt: this.createdAt,
    };
  }

  /**
   * Validate entity data
   * @returns {Object} Validation result
   */
  validate() {
    const errors = [];

    if (!this.categoryName || this.categoryName.trim().length === 0) {
      errors.push("Category name is required");
    }

    if (this.categoryName && this.categoryName.length > 100) {
      errors.push("Category name must be 100 characters or less");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

module.exports = SocioProfessionalCategory;
