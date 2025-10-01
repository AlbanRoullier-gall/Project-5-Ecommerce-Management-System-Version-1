/**
 * Product ORM Entity
 * Represents a product with pricing and category information
 */
class Product {
  constructor(data = {}) {
    this.id = data.id || null;
    this.name = data.name || "";
    this.description = data.description || "";
    this.price = data.price || 0;
    this.vatRate = data.vatRate || 0;
    this.categoryId = data.categoryId || null;
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.createdAt = data.createdAt || null;
    this.updatedAt = data.updatedAt || null;
  }

  /**
   * Activate the product
   */
  activate() {
    this.isActive = true;
  }

  /**
   * Deactivate the product
   */
  deactivate() {
    this.isActive = false;
  }

  /**
   * Get price with VAT included
   * @returns {number} Price with VAT
   */
  getPriceWithVAT() {
    return this.price * (1 + this.vatRate / 100);
  }

  /**
   * Convert entity to database row format
   * @returns {Object} Database row
   */
  toDbRow() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      price: this.price,
      vat_rate: this.vatRate,
      category_id: this.categoryId,
      is_active: this.isActive,
      created_at: this.createdAt,
      updated_at: this.updatedAt,
    };
  }

  /**
   * Create entity from database row
   * @param {Object} row Database row
   * @returns {Product} Product instance
   */
  static fromDbRow(row) {
    return new Product({
      id: row.id,
      name: row.name,
      description: row.description,
      price: row.price,
      vatRate: row.vat_rate,
      categoryId: row.category_id,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }

  /**
   * Create entity from database row with joins
   * @param {Object} row Database row with joins
   * @returns {Product} Product instance with additional fields
   */
  static fromDbRowWithJoins(row) {
    const product = Product.fromDbRow(row);
    product.categoryName = row.category_name;
    return product;
  }

  /**
   * Convert to public DTO
   * @returns {Object} Public product data
   */
  toPublicDTO() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      price: this.price,
      vatRate: this.vatRate,
      categoryId: this.categoryId,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      priceWithVAT: this.getPriceWithVAT(),
    };
  }

  /**
   * Validate entity data
   * @returns {Object} Validation result
   */
  validate() {
    const errors = [];

    if (!this.name || this.name.trim().length === 0) {
      errors.push("Product name is required");
    }

    if (this.name && this.name.length > 255) {
      errors.push("Product name must be 255 characters or less");
    }

    if (this.description && this.description.length > 1000) {
      errors.push("Description must be 1000 characters or less");
    }

    if (this.price === null || this.price === undefined) {
      errors.push("Price is required");
    } else if (this.price < 0) {
      errors.push("Price must be positive");
    }

    if (this.vatRate === null || this.vatRate === undefined) {
      errors.push("VAT rate is required");
    } else if (this.vatRate < 0 || this.vatRate > 100) {
      errors.push("VAT rate must be between 0 and 100");
    }

    if (!this.categoryId) {
      errors.push("Category ID is required");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

module.exports = Product;
