/**
 * ProductImage ORM Entity
 * Represents a product image
 */

/**
 * Interface correspondant exactement à la table product_images
 */
export interface ProductImageData {
  id: number;
  product_id: number;
  filename: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  width: number;
  height: number;
  alt_text: string | null;
  description: string | null;
  is_active: boolean;
  order_index: number;
  created_at: Date;
  updated_at: Date;
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
  public readonly fileSize: number;
  public readonly mimeType: string;
  public readonly width: number;
  public readonly height: number;
  public readonly altText: string;
  public readonly description: string;
  public readonly isActive: boolean;
  public readonly orderIndex: number;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(data: ProductImageData) {
    this.id = data.id;
    this.productId = data.product_id;
    this.filename = data.filename;
    this.filePath = data.file_path;
    this.fileSize = data.file_size;
    this.mimeType = data.mime_type;
    this.width = data.width;
    this.height = data.height;
    this.altText = data.alt_text || "";
    this.description = data.description || "";
    this.isActive = data.is_active;
    this.orderIndex = data.order_index;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  /**
   * Vérifier si l'image est valide
   */
  isValid(): boolean {
    return (
      this.filename.length > 0 &&
      this.filePath.length > 0 &&
      this.fileSize > 0 &&
      this.mimeType.length > 0 &&
      this.productId > 0 &&
      this.width >= 0 &&
      this.height >= 0
    );
  }

  /**
   * Valider les données de l'image
   * @returns {Object} Résultat de validation
   */
  validate(): ProductImageValidationResult {
    const errors: string[] = [];

    if (!this.filename || this.filename.trim().length === 0) {
      errors.push("Filename is required");
    }

    if (!this.filePath || this.filePath.trim().length === 0) {
      errors.push("File path is required");
    }

    if (this.fileSize <= 0) {
      errors.push("File size must be greater than 0");
    }

    if (!this.mimeType || this.mimeType.trim().length === 0) {
      errors.push("MIME type is required");
    }

    if (!this.productId || this.productId <= 0) {
      errors.push("Product ID is required and must be positive");
    }

    if (this.width < 0) {
      errors.push("Width must be non-negative");
    }

    if (this.height < 0) {
      errors.push("Height must be non-negative");
    }

    if (this.filename && this.filename.length > 255) {
      errors.push("Filename must be less than 255 characters");
    }

    if (this.filePath && this.filePath.length > 500) {
      errors.push("File path must be less than 500 characters");
    }

    if (this.mimeType && this.mimeType.length > 100) {
      errors.push("MIME type must be less than 100 characters");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

export default ProductImage;
