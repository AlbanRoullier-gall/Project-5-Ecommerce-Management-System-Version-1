/**
 * Customer ORM Entity
 * Represents a customer with personal information and authentication
 */
class Customer {
  constructor(data = {}) {
    this.customerId = data.customerId || null;
    this.civilityId = data.civilityId || null;
    this.firstName = data.firstName || "";
    this.lastName = data.lastName || "";
    this.email = data.email || "";
    this.socioProfessionalCategoryId = data.socioProfessionalCategoryId || null;
    this.phoneNumber = data.phoneNumber || null;
    this.birthday = data.birthday || null;
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.createdAt = data.createdAt || null;
    this.updatedAt = data.updatedAt || null;
  }

  /**
   * Get full name of the customer
   * @returns {string} Full name
   */
  fullName() {
    return `${this.firstName} ${this.lastName}`.trim();
  }

  /**
   * Activate the customer
   */
  activate() {
    this.isActive = true;
  }

  /**
   * Deactivate the customer
   */
  deactivate() {
    this.isActive = false;
  }

  /**
   * Convert entity to database row format
   * @returns {Object} Database row
   */
  toDbRow() {
    return {
      customer_id: this.customerId,
      civility_id: this.civilityId,
      first_name: this.firstName,
      last_name: this.lastName,
      email: this.email,
      socio_professional_category_id: this.socioProfessionalCategoryId,
      phone_number: this.phoneNumber,
      birthday: this.birthday,
      is_active: this.isActive,
      created_at: this.createdAt,
      updated_at: this.updatedAt,
    };
  }

  /**
   * Create entity from database row
   * @param {Object} row Database row
   * @returns {Customer} Customer instance
   */
  static fromDbRow(row) {
    return new Customer({
      customerId: row.customer_id,
      civilityId: row.civility_id,
      firstName: row.first_name,
      lastName: row.last_name,
      email: row.email,
      socioProfessionalCategoryId: row.socio_professional_category_id,
      phoneNumber: row.phone_number,
      birthday: row.birthday,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }

  /**
   * Create entity from database row with joined data
   * @param {Object} row Database row with joins
   * @returns {Customer} Customer instance with additional fields
   */
  static fromDbRowWithJoins(row) {
    const customer = Customer.fromDbRow(row);
    customer.civility = row.civility;
    customer.socioProfessionalCategory = row.socio_professional_category;
    return customer;
  }

  /**
   * Convert to public DTO (without sensitive data)
   * @returns {Object} Public customer data
   */
  toPublicDTO() {
    return {
      customerId: this.customerId,
      civilityId: this.civilityId,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      socioProfessionalCategoryId: this.socioProfessionalCategoryId,
      phoneNumber: this.phoneNumber,
      birthday: this.birthday,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      fullName: this.fullName(),
    };
  }

  /**
   * Validate entity data
   * @returns {Object} Validation result
   */
  validate() {
    const errors = [];

    if (!this.firstName || this.firstName.trim().length === 0) {
      errors.push("First name is required");
    }

    if (!this.lastName || this.lastName.trim().length === 0) {
      errors.push("Last name is required");
    }

    if (!this.email || this.email.trim().length === 0) {
      errors.push("Email is required");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) {
      errors.push("Email format is invalid");
    }

    if (!this.civilityId) {
      errors.push("Civility ID is required");
    }

    if (!this.socioProfessionalCategoryId) {
      errors.push("Socio-professional category ID is required");
    }

    if (this.phoneNumber && !/^[\d\s\-\+\(\)]+$/.test(this.phoneNumber)) {
      errors.push("Phone number format is invalid");
    }

    if (this.birthday && new Date(this.birthday) > new Date()) {
      errors.push("Birthday cannot be in the future");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

module.exports = Customer;
