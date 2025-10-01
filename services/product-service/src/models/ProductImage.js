/**
 * ProductImage ORM Entity
 * Represents an image associated with a product
 */
class ProductImage {
  constructor(data = {}) {
    this.id = data.id || null;
    this.productId = data.productId || null;
    this.filename = data.filename || "";
    this.filePath = data.filePath || "";
    this.fileSize = data.fileSize || 0;
    this.mimeType = data.mimeType || "";
    this.width = data.width || 0;
    this.height = data.height || 0;
    this.altText = data.altText || "";
    this.description = data.description || "";
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.orderIndex = data.orderIndex || 0;
    this.createdAt = data.createdAt || null;
    this.updatedAt = data.updatedAt || null;
  }

  /**
   * Activate the image
   */
  activate() {
    this.isActive = true;
  }

  /**
   * Deactivate the image
   */
  deactivate() {
    this.isActive = false;
  }

  /**
   * Get URL for the image
   * @returns {string} Image URL
   */
  getUrl() {
    // In a real application, this would construct the full URL
    return `/uploads/products/${this.filename}`;
  }

  /**
   * Convert entity to database row format
   * @returns {Object} Database row
   */
  toDbRow() {
    return {
      id: this.id,
      product_id: this.productId,
      filename: this.filename,
      file_path: this.filePath,
      file_size: this.fileSize,
      mime_type: this.mimeType,
      width: this.width,
      height: this.height,
      alt_text: this.altText,
      description: this.description,
      is_active: this.isActive,
      order_index: this.orderIndex,
      created_at: this.createdAt,
      updated_at: this.updatedAt,
    };
  }

  /**
   * Create entity from database row
   * @param {Object} row Database row
   * @returns {ProductImage} ProductImage instance
   */
  static fromDbRow(row) {
    return new ProductImage({
      id: row.id,
      productId: row.product_id,
      filename: row.filename,
      filePath: row.file_path,
      fileSize: row.file_size,
      mimeType: row.mime_type,
      width: row.width,
      height: row.height,
      altText: row.alt_text,
      description: row.description,
      isActive: row.is_active,
      orderIndex: row.order_index,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }

  /**
   * Convert to public DTO
   * @returns {Object} Public image data
   */
  toPublicDTO() {
    return {
      id: this.id,
      productId: this.productId,
      filename: this.filename,
      filePath: this.filePath,
      fileSize: this.fileSize,
      mimeType: this.mimeType,
      width: this.width,
      height: this.height,
      altText: this.altText,
      description: this.description,
      isActive: this.isActive,
      orderIndex: this.orderIndex,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      url: this.getUrl(),
    };
  }

  /**
   * Validate entity data
   * @returns {Object} Validation result
   */
  validate() {
    const errors = [];

    if (!this.productId) {
      errors.push("Product ID is required");
    }

    if (!this.filename || this.filename.trim().length === 0) {
      errors.push("Filename is required");
    }

    if (!this.filePath || this.filePath.trim().length === 0) {
      errors.push("File path is required");
    }

    if (this.fileSize < 0) {
      errors.push("File size must be positive");
    }

    if (this.width < 0) {
      errors.push("Width must be positive");
    }

    if (this.height < 0) {
      errors.push("Height must be positive");
    }

    if (this.orderIndex < 0) {
      errors.push("Order index must be positive");
    }

    if (this.mimeType && !this.mimeType.startsWith("image/")) {
      errors.push("MIME type must be an image type");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

module.exports = ProductImage;
