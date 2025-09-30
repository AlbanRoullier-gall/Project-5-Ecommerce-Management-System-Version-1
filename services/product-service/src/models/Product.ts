/**
 * Product ORM Entity
 * Represents a product with pricing and category information
 */

/**
 * Interface correspondant exactement à la table products
 */
export interface ProductData {
  id: number | null;
  name: string;
  description: string | null;
  price: number;
  vat_rate: number;
  category_id: number;
  is_active: boolean;
  created_at: Date | null;
  updated_at: Date | null;
}

/**
 * Résultat de validation du produit
 */
export interface ProductValidationResult {
  isValid: boolean;
  errors: string[];
}

class Product {
  public readonly id: number | null;
  public readonly name: string;
  public readonly description: string;
  public readonly price: number;
  public readonly vatRate: number;
  public readonly categoryId: number | null;
  public readonly isActive: boolean;
  public readonly createdAt: Date | null;
  public readonly updatedAt: Date | null;

  constructor(data: ProductData) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description || "";
    this.price = data.price;
    this.vatRate = data.vat_rate;
    this.categoryId = data.category_id;
    this.isActive = data.is_active;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  /**
   * Vérifier si le produit est valide
   */
  isValid(): boolean {
    return (
      this.name.length > 0 &&
      this.price > 0 &&
      this.vatRate >= 0 &&
      this.categoryId !== null
    );
  }

  /**
   * Valider les données du produit
   * @returns {Object} Résultat de validation
   */
  validate(): ProductValidationResult {
    const errors: string[] = [];

    if (!this.name || this.name.trim().length === 0) {
      errors.push("Product name is required");
    }

    if (this.price <= 0) {
      errors.push("Product price must be greater than 0");
    }

    if (this.vatRate < 0 || this.vatRate > 100) {
      errors.push("VAT rate must be between 0 and 100");
    }

    if (!this.categoryId || this.categoryId <= 0) {
      errors.push("Category ID is required and must be positive");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Calculer le prix TTC
   * @returns {number} Prix avec TVA
   */
  getPriceWithVAT(): number {
    return this.price * (1 + this.vatRate / 100);
  }
}

export default Product;