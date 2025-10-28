/**
 * Entité ORM CustomerAddress
 * Représente l'adresse d'expédition d'un client
 */
export interface CustomerAddressData {
  addressId: number;
  customerId: number;
  address: string;
  postalCode: string;
  city: string;
  countryId: number;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

class CustomerAddress {
  public addressId: number;
  public customerId: number;
  public address: string;
  public postalCode: string;
  public city: string;
  public countryId: number;
  public isDefault: boolean;
  public createdAt: Date;
  public updatedAt: Date;
  public countryName?: string | undefined;

  constructor(data: CustomerAddressData) {
    this.addressId = data.addressId;
    this.customerId = data.customerId;
    this.address = data.address;
    this.postalCode = data.postalCode;
    this.city = data.city;
    this.countryId = data.countryId;
    this.isDefault = data.isDefault;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  /**
   * Formater l'adresse en une seule chaîne
   * @returns {string} Adresse formatée
   */
  formatAddress(): string {
    return `${this.address}, ${this.postalCode} ${this.city}`.trim();
  }

  /**
   * Définir cette adresse comme par défaut
   */
  setAsDefault(): void {
    this.isDefault = true;
  }

  /**
   * Valider les données de l'entité
   * @returns {Object} Résultat de validation
   */
  validate(): ValidationResult {
    const errors: string[] = [];

    if (!this.customerId) {
      errors.push("Customer ID is required");
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
