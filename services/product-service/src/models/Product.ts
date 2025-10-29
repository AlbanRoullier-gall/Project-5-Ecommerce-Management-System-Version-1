/**
 * Entité ORM Produit
 * Représente un produit avec informations de prix et de catégorie
 */

/**
 * Interface correspondant exactement à la table products
 */
export interface ProductData {
  id: number;
  name: string;
  description: string | null;
  price: number;
  vat_rate: number;
  category_id: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

/**
 * Résultat de validation du produit
 */
export interface ProductValidationResult {
  isValid: boolean;
  errors: string[];
}

class Product {
  public readonly id: number;
  public readonly name: string;
  public readonly description: string;
  public readonly price: number;
  public readonly vatRate: number;
  public readonly categoryId: number;
  public readonly isActive: boolean;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

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
      this.vatRate <= 100 &&
      this.categoryId > 0
    );
  }

  /**
   * Valider les données du produit
   * @returns {Object} Résultat de validation
   */
  validate(): ProductValidationResult {
    const errors: string[] = [];

    if (!this.name || this.name.trim().length === 0) {
      errors.push("Le nom du produit est requis");
    }

    if (this.price <= 0) {
      errors.push("Le prix du produit doit être supérieur à 0");
    }

    if (this.vatRate < 0 || this.vatRate > 100) {
      errors.push("Le taux de TVA doit être entre 0 et 100");
    }

    if (!this.categoryId || this.categoryId <= 0) {
      errors.push("L'ID de catégorie est requis et doit être positif");
    }

    if (this.name && this.name.length > 255) {
      errors.push("Le nom du produit doit faire moins de 255 caractères");
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
