/**
 * Entité ORM Customer
 * Représente un client avec ses informations personnelles et son authentification
 */
export interface CustomerData {
  customerId: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

class Customer {
  public customerId: number;
  public firstName: string;
  public lastName: string;
  public email: string;
  public phoneNumber: string | null;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(data: CustomerData) {
    this.customerId = data.customerId;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.email = data.email;
    this.phoneNumber = data.phoneNumber;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  /**
   * Valider les données de l'entité
   * @returns {Object} Résultat de validation
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

    if (this.phoneNumber && !/^[\d\s\-\+\(\)]+$/.test(this.phoneNumber)) {
      errors.push("Phone number format is invalid");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

export default Customer;
