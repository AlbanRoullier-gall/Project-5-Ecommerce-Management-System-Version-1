/**
 * Entité ORM Image de Produit
 * Représente une image de produit
 */

/**
 * Interface correspondant exactement à la table product_images simplifiée
 */
export interface ProductImageData {
  id: number;
  product_id: number;
  filename: string;
  order_index: number;
  image_data?: Buffer | null; // Données binaires de l'image stockées en base
}

/**
 * Résultat de validation de l'image de produit
 */
export interface ProductImageValidationResult {
  isValid: boolean;
  errors: string[];
}

class ProductImage {
  public readonly id: number;
  public readonly productId: number;
  public readonly filename: string;
  public readonly orderIndex: number;
  public readonly imageData: Buffer | null; // Données binaires de l'image

  constructor(data: ProductImageData) {
    this.id = data.id;
    this.productId = data.product_id;
    this.filename = data.filename;
    this.orderIndex = data.order_index;
    this.imageData = data.image_data || null;
  }

  /**
   * Vérifier si l'image est valide
   * L'image est valide si elle a des imageData
   */
  isValid(): boolean {
    const hasImageData = !!(this.imageData && this.imageData.length > 0);
    return this.filename.length > 0 && this.productId > 0 && hasImageData;
  }

  /**
   * Valider les données de l'image
   * @returns {Object} Résultat de validation
   */
  validate(): ProductImageValidationResult {
    const errors: string[] = [];

    if (!this.filename || this.filename.trim().length === 0) {
      errors.push("Le nom de fichier est requis");
    }

    // L'image doit avoir des imageData
    const hasImageData = this.imageData && this.imageData.length > 0;
    if (!hasImageData) {
      errors.push("L'image doit avoir des données binaires (image_data)");
    }

    if (!this.productId || this.productId <= 0) {
      errors.push("L'ID du produit est requis et doit être positif");
    }

    if (this.filename && this.filename.length > 255) {
      errors.push("Le nom de fichier doit faire moins de 255 caractères");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

export default ProductImage;
