/**
 * Entité ORM Customer
 * Représente un client avec ses informations personnelles et son authentification
 */
export interface CustomerData {
  customerId: number;
  civilityId: number;
  firstName: string;
  lastName: string;
  email: string;
  socioProfessionalCategoryId: number;
  phoneNumber: string | null;
  birthday: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

class Customer {
  public customerId: number;
  public civilityId: number;
  public firstName: string;
  public lastName: string;
  public email: string;
  public socioProfessionalCategoryId: number;
  public phoneNumber: string | null;
  public birthday: Date | null;
  public isActive: boolean;
  public createdAt: Date;
  public updatedAt: Date;
  public civility?: any;
  public socioProfessionalCategory?: any;

  constructor(data: CustomerData) {
    this.customerId = data.customerId;
    this.civilityId = data.civilityId;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.email = data.email;
    this.socioProfessionalCategoryId = data.socioProfessionalCategoryId;
    this.phoneNumber = data.phoneNumber;
    this.birthday = data.birthday;
    this.isActive = data.isActive;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  /**
   * Obtenir le nom complet du client
   * @returns {string} Nom complet
   */
  fullName(): string {
    return `${this.firstName} ${this.lastName}`.trim();
  }

  /**
   * Activer le client
   */
  activate(): void {
    this.isActive = true;
  }

  /**
   * Désactiver le client
   */
  deactivate(): void {
    this.isActive = false;
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
