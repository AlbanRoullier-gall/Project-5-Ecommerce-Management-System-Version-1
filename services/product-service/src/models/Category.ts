/**
 * Entité ORM Catégorie
 * Représente une catégorie de produit
 */

/**
 * Interface correspondant exactement à la table categories
 */
export interface CategoryData {
  id: number;
  name: string;
  description: string | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * Résultat de validation de la catégorie
 */
export interface CategoryValidationResult {
  isValid: boolean;
  errors: string[];
}

class Category {
  public readonly id: number;
  public readonly name: string;
  public readonly description: string;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

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
      errors.push("Le nom de la catégorie est requis");
    }

    if (this.name && this.name.length > 100) {
      errors.push("Le nom de la catégorie doit faire moins de 100 caractères");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

export default Category;
