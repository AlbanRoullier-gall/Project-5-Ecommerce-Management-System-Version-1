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
}

export default Product;
