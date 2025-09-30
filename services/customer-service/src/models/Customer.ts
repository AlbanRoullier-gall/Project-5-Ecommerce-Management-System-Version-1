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
  socioProfessionalCategoryId?: number | null;
  phoneNumber?: string | null;
  birthday?: Date | null;
  isActive?: boolean;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

// CustomerPublicDTO moved to /api/dto/CustomerDTO.ts

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
}

export default Customer;
