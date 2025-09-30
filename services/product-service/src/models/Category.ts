/**
 * Category ORM Entity
 * Represents a product category
 */

/**
 * Interface correspondant exactement à la table categories
 */
export interface CategoryData {
  id: number | null;
  name: string;
  description: string | null;
  created_at: Date | null;
  updated_at: Date | null;
}

/**
 * Résultat de validation de la catégorie
 */
export interface CategoryValidationResult {
  isValid: boolean;
  errors: string[];
}

class Category {
  public readonly id: number | null;
  public readonly name: string;
  public readonly description: string;
  public readonly createdAt: Date | null;
  public readonly updatedAt: Date | null;

  constructor(data: CategoryData) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description || "";
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  /**
   * Vérifier si la catégorie est valide
   */
  isValid(): boolean {
    return this.name.length > 0;
  }

  /**
   * Valider les données de la catégorie
   * @returns {Object} Résultat de validation
   */
  validate(): CategoryValidationResult {
    const errors: string[] = [];

    if (!this.name || this.name.trim().length === 0) {
      errors.push("Category name is required");
    }

    if (this.name && this.name.length > 100) {
      errors.push("Category name must be less than 100 characters");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

export default Category;