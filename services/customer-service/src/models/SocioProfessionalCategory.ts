/**
 * SocioProfessionalCategory ORM Entity
 * Represents socio-professional categories
 */
export interface SocioProfessionalCategoryData {
  categoryId?: number | null;
  categoryName?: string;
  createdAt?: Date | null;
}

export interface SocioProfessionalCategoryDbRow {
  category_id?: number | null;
  category_name?: string;
  created_at?: Date | null;
}

export interface SocioProfessionalCategoryPublicDTO {
  categoryId: number | null;
  categoryName: string;
  createdAt: Date | null;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

class SocioProfessionalCategory {
  public categoryId: number | null;
  public categoryName: string;
  public createdAt: Date | null;

  constructor(data: SocioProfessionalCategoryData = {}) {
    this.categoryId = data.categoryId || null;
    this.categoryName = data.categoryName || "";
    this.createdAt = data.createdAt || null;
  }

  /**
   * Convert entity to database row format
   * @returns {Object} Database row
   */
  toDbRow(): SocioProfessionalCategoryDbRow {
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
  static fromDbRow(
    row: SocioProfessionalCategoryDbRow
  ): SocioProfessionalCategory {
    return new SocioProfessionalCategory({
      categoryId: row.category_id ?? null,
      categoryName: row.category_name ?? "",
      createdAt: row.created_at ?? null,
    });
  }

  /**
   * Validate entity data
   * @returns {Object} Validation result
   */
  validate(): ValidationResult {
    const errors: string[] = [];

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

export default SocioProfessionalCategory;
