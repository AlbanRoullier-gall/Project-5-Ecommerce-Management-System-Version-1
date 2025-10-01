/**
 * ProductImageVariant ORM Entity
 * Represents a variant of a product image (thumbnail, medium, large, etc.)
 */
class ProductImageVariant {
  constructor(data = {}) {
    this.id = data.id || null;
    this.imageId = data.imageId || null;
    this.variantType = data.variantType || "";
    this.filePath = data.filePath || "";
    this.width = data.width || 0;
    this.height = data.height || 0;
    this.fileSize = data.fileSize || 0;
    this.quality = data.quality || 90;
    this.createdAt = data.createdAt || null;
  }

  /**
   * Get URL for the image variant
   * @returns {string} Image variant URL
   */
  getUrl() {
    // In a real application, this would construct the full URL
    return `/uploads/products/variants/${this.filePath}`;
  }

  /**
   * Convert entity to database row format
   * @returns {Object} Database row
   */
  toDbRow() {
    return {
      id: this.id,
      image_id: this.imageId,
      variant_type: this.variantType,
      file_path: this.filePath,
      width: this.width,
      height: this.height,
      file_size: this.fileSize,
      quality: this.quality,
      created_at: this.createdAt,
    };
  }

  /**
   * Create entity from database row
   * @param {Object} row Database row
   * @returns {ProductImageVariant} ProductImageVariant instance
   */
  static fromDbRow(row) {
    return new ProductImageVariant({
      id: row.id,
      imageId: row.image_id,
      variantType: row.variant_type,
      filePath: row.file_path,
      width: row.width,
      height: row.height,
      fileSize: row.file_size,
      quality: row.quality,
      createdAt: row.created_at,
    });
  }

  /**
   * Convert to public DTO
   * @returns {Object} Public variant data
   */
  toPublicDTO() {
    return {
      id: this.id,
      imageId: this.imageId,
      variantType: this.variantType,
      filePath: this.filePath,
      width: this.width,
      height: this.height,
      fileSize: this.fileSize,
      quality: this.quality,
      createdAt: this.createdAt,
      url: this.getUrl(),
    };
  }

  /**
   * Validate entity data
   * @returns {Object} Validation result
   */
  validate() {
    const errors = [];

    if (!this.imageId) {
      errors.push("Image ID is required");
    }

    if (!this.variantType || this.variantType.trim().length === 0) {
      errors.push("Variant type is required");
    }

    if (!this.filePath || this.filePath.trim().length === 0) {
      errors.push("File path is required");
    }

    if (this.width < 0) {
      errors.push("Width must be positive");
    }

    if (this.height < 0) {
      errors.push("Height must be positive");
    }

    if (this.fileSize < 0) {
      errors.push("File size must be positive");
    }

    if (this.quality < 1 || this.quality > 100) {
      errors.push("Quality must be between 1 and 100");
    }

    // Validate variant type
    const validTypes = ["thumbnail", "small", "medium", "large", "original"];
    if (this.variantType && !validTypes.includes(this.variantType)) {
      errors.push(`Variant type must be one of: ${validTypes.join(", ")}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

module.exports = ProductImageVariant;
