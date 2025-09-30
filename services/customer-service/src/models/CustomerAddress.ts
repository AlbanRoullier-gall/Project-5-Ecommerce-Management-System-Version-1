/**
 * CustomerAddress ORM Entity
 * Represents a customer's address (shipping or billing)
 */
export interface CustomerAddressData {
  addressId?: number | null;
  customerId?: number | null;
  addressType?: string;
  address?: string;
  postalCode?: string;
  city?: string;
  countryId?: number | null;
  isDefault?: boolean;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

// CustomerAddressPublicDTO moved to /api/dto/AddressDTO.ts

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

class CustomerAddress {
  public addressId: number | null;
  public customerId: number | null;
  public addressType: string;
  public address: string;
  public postalCode: string;
  public city: string;
  public countryId: number | null;
  public isDefault: boolean;
  public createdAt: Date | null;
  public updatedAt: Date | null;
  public countryName?: string | undefined;

  constructor(data: CustomerAddressData = {}) {
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
  formatAddress(): string {
    return `${this.address}, ${this.postalCode} ${this.city}`.trim();
  }

  /**
   * Set this address as default
   */
  setAsDefault(): void {
    this.isDefault = true;
  }

  /**
   * Validate entity data
   * @returns {Object} Validation result
   */
  validate(): ValidationResult {
    const errors: string[] = [];

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

export default CustomerAddress;
