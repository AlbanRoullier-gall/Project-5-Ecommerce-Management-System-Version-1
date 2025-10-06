/**
 * SocioProfessionalCategory ORM Entity
 * Represents socio-professional categories
 */
export interface SocioProfessionalCategoryData {
  categoryId?: number | null;
  categoryName?: string;
  createdAt?: Date | null;
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
