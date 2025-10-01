/**
 * CustomerAddress ORM Entity
 * Represents a customer's address (shipping or billing)
 */
class CustomerAddress {
  constructor(data = {}) {
    this.addressId = data.addressId || null;
    this.customerId = data.customerId || null;
    this.addressType = data.addressType || "";
    this.address = data.address || "";
    this.postalCode = data.postalCode || "";
    this.city = data.city || "";
    this.countryId = data.countryId || null;
    this.isDefault = data.isDefault !== undefined ? data.isDefault : false;
    this.createdAt = data.createdAt || null;
    this.updatedAt = data.updatedAt || null;
  }

  /**
   * Format address as a single string
   * @returns {string} Formatted address
   */
  formatAddress() {
    return `${this.address}, ${this.postalCode} ${this.city}`.trim();
  }

  /**
   * Set this address as default
   */
  setAsDefault() {
    this.isDefault = true;
  }

  /**
   * Convert entity to database row format
   * @returns {Object} Database row
   */
  toDbRow() {
    return {
      address_id: this.addressId,
      customer_id: this.customerId,
      address_type: this.addressType,
      address: this.address,
      postal_code: this.postalCode,
      city: this.city,
      country_id: this.countryId,
      is_default: this.isDefault,
      created_at: this.createdAt,
      updated_at: this.updatedAt,
    };
  }

  /**
   * Create entity from database row
   * @param {Object} row Database row
   * @returns {CustomerAddress} CustomerAddress instance
   */
  static fromDbRow(row) {
    return new CustomerAddress({
      addressId: row.address_id,
      customerId: row.customer_id,
      addressType: row.address_type,
      address: row.address,
      postalCode: row.postal_code,
      city: row.city,
      countryId: row.country_id,
      isDefault: row.is_default,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }

  /**
   * Create entity from database row with joined data
   * @param {Object} row Database row with joins
   * @returns {CustomerAddress} CustomerAddress instance with additional fields
   */
  static fromDbRowWithJoins(row) {
    const address = CustomerAddress.fromDbRow(row);
    address.countryName = row.country_name;
    return address;
  }

  /**
   * Convert to public DTO
   * @returns {Object} Public address data
   */
  toPublicDTO() {
    return {
      addressId: this.addressId,
      customerId: this.customerId,
      addressType: this.addressType,
      address: this.address,
      postalCode: this.postalCode,
      city: this.city,
      countryId: this.countryId,
      isDefault: this.isDefault,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      formattedAddress: this.formatAddress(),
    };
  }

  /**
   * Validate entity data
   * @returns {Object} Validation result
   */
  validate() {
    const errors = [];

    if (!this.customerId) {
      errors.push("Customer ID is required");
    }

    if (
      !this.addressType ||
      !["shipping", "billing"].includes(this.addressType)
    ) {
      errors.push('Address type must be either "shipping" or "billing"');
    }

    if (!this.address || this.address.trim().length === 0) {
      errors.push("Address is required");
    }

    if (!this.postalCode || this.postalCode.trim().length === 0) {
      errors.push("Postal code is required");
    }

    if (!this.city || this.city.trim().length === 0) {
      errors.push("City is required");
    }

    if (!this.countryId) {
      errors.push("Country ID is required");
    }

    if (this.postalCode && !/^[\d\w\s\-]+$/.test(this.postalCode)) {
      errors.push("Postal code format is invalid");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

module.exports = CustomerAddress;
