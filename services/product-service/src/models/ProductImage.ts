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
  file_path: string;
  order_index: number;
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
  public readonly filePath: string;
  public readonly orderIndex: number;

  constructor(data: ProductImageData) {
    this.id = data.id;
    this.productId = data.product_id;
    this.filename = data.filename;
    this.filePath = data.file_path;
    this.orderIndex = data.order_index;
  }

  /**
   * Vérifier si l'image est valide
   */
  isValid(): boolean {
    return (
      this.filename.length > 0 && this.filePath.length > 0 && this.productId > 0
    );
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

    if (!this.filePath || this.filePath.trim().length === 0) {
      errors.push("Le chemin du fichier est requis");
    }

    if (!this.productId || this.productId <= 0) {
      errors.push("L'ID du produit est requis et doit être positif");
    }

    if (this.filename && this.filename.length > 255) {
      errors.push("Le nom de fichier doit faire moins de 255 caractères");
    }

    if (this.filePath && this.filePath.length > 500) {
      errors.push("Le chemin du fichier doit faire moins de 500 caractères");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

export default ProductImage;
