/**
 * Customer ORM Entity
 * Represents a customer with personal information and authentication
 */
export interface CustomerData {
  customerId?: number | null;
  civilityId?: number | null;
  firstName?: string;
  lastName?: string;
  email?: string;
  passwordHash?: string;
  socioProfessionalCategoryId?: number | null;
  phoneNumber?: string | null;
  birthday?: Date | null;
  isActive?: boolean;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

export interface CustomerDbRow {
  customer_id?: number | null;
  civility_id?: number | null;
  first_name?: string;
  last_name?: string;
  email?: string;
  password_hash?: string;
  socio_professional_category_id?: number | null;
  phone_number?: string | null;
  birthday?: Date | null;
  is_active?: boolean;
  created_at?: Date | null;
  updated_at?: Date | null;
}

export interface CustomerPublicDTO {
  customerId: number | null;
  civilityId: number | null;
  firstName: string;
  lastName: string;
  email: string;
  socioProfessionalCategoryId: number | null;
  phoneNumber: string | null;
  birthday: Date | null;
  isActive: boolean;
  createdAt: Date | null;
  updatedAt: Date | null;
  fullName: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

class Customer {
  public customerId: number | null;
  public civilityId: number | null;
  public firstName: string;
  public lastName: string;
  public email: string;
  public passwordHash: string;
  public socioProfessionalCategoryId: number | null;
  public phoneNumber: string | null;
  public birthday: Date | null;
  public isActive: boolean;
  public createdAt: Date | null;
  public updatedAt: Date | null;
  public civility?: any;
  public socioProfessionalCategory?: any;

  constructor(data: CustomerData = {}) {
    this.customerId = data.customerId || null;
    this.civilityId = data.civilityId || null;
    this.firstName = data.firstName || "";
    this.lastName = data.lastName || "";
    this.email = data.email || "";
    this.passwordHash = data.passwordHash || "";
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
  fullName(): string {
    return `${this.firstName} ${this.lastName}`.trim();
  }

  /**
   * Activate the customer
   */
  activate(): void {
    this.isActive = true;
  }

  /**
   * Deactivate the customer
   */
  deactivate(): void {
    this.isActive = false;
  }

  /**
   * Convert entity to database row format
   * @returns {Object} Database row
   */
  toDbRow(): CustomerDbRow {
    return {
      customer_id: this.customerId,
      civility_id: this.civilityId,
      first_name: this.firstName,
      last_name: this.lastName,
      email: this.email,
      password_hash: this.passwordHash,
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
  static fromDbRow(row: CustomerDbRow): Customer {
    return new Customer({
      customerId: row.customer_id ?? null,
      civilityId: row.civility_id ?? null,
      firstName: row.first_name ?? "",
      lastName: row.last_name ?? "",
      email: row.email ?? "",
      passwordHash: row.password_hash ?? "",
      socioProfessionalCategoryId: row.socio_professional_category_id ?? null,
      phoneNumber: row.phone_number ?? null,
      birthday: row.birthday ?? null,
      isActive: row.is_active ?? true,
      createdAt: row.created_at ?? null,
      updatedAt: row.updated_at ?? null,
    });
  }

  /**
   * Create entity from database row with joined data
   * @param {Object} row Database row with joins
   * @returns {Customer} Customer instance with additional fields
   */
  static fromDbRowWithJoins(
    row: CustomerDbRow & { civility?: any; socio_professional_category?: any }
  ): Customer {
    const customer = Customer.fromDbRow(row);
    customer.civility = row.civility;
    customer.socioProfessionalCategory = row.socio_professional_category;
    return customer;
  }

  /**
   * Convert to public DTO (without sensitive data)
   * @returns {Object} Public customer data
   */
  toPublicDTO(): CustomerPublicDTO {
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
  validate(): ValidationResult {
    const errors: string[] = [];

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

  /**
   * Validate password requirements
   * @param {string} password Plain text password
   * @returns {Object} Validation result
   */
  static validatePassword(password: string): ValidationResult {
    const errors: string[] = [];

    if (!password || password.length < 6) {
      errors.push("Password must be at least 6 characters long");
    }

    if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter");
    }

    if (!/[a-z]/.test(password)) {
      errors.push("Password must contain at least one lowercase letter");
    }

    if (!/\d/.test(password)) {
      errors.push("Password must contain at least one number");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

export default Customer;
