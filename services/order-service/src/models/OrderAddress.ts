/**
 * OrderAddress Model
 * Représente une adresse de commande dans le système
 *
 * Architecture : Modèle centré sur la base de données
 * - Correspond exactement à la table `order_addresses`
 * - Contient la logique métier de l'adresse de commande
 * - Validation et transformation des données
 */

import { AddressType } from "../types/Enums";

/**
 * Interface correspondant exactement à la table order_addresses
 */
export interface OrderAddressData {
  id: number;
  order_id: number;
  address_type: AddressType;
  first_name: string;
  last_name: string;
  address: string;
  postal_code: string | null;
  city: string;
  country_name: string;
  phone: string | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * Résultat de validation de l'adresse de commande
 */
export interface OrderAddressValidationResult {
  isValid: boolean;
  errors: string[];
}

class OrderAddress {
  public readonly id: number;
  public readonly orderId: number;
  public readonly addressType: AddressType;
  public readonly firstName: string;
  public readonly lastName: string;
  public readonly address: string;
  public readonly postalCode: string | null;
  public readonly city: string;
  public readonly countryName: string;
  public readonly phone: string | null;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(data: OrderAddressData) {
    this.id = data.id;
    this.orderId = data.order_id;
    this.addressType = data.address_type;
    this.firstName = data.first_name;
    this.lastName = data.last_name;
    this.address = data.address;
    this.postalCode = data.postal_code;
    this.city = data.city;
    this.countryName = data.country_name;
    this.phone = data.phone;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  /**
   * Vérifier si l'adresse est valide
   */
  isValid(): boolean {
    return (
      this.orderId > 0 &&
      this.addressType !== null &&
      this.firstName !== null &&
      this.firstName.length > 0 &&
      this.lastName !== null &&
      this.lastName.length > 0 &&
      this.address !== null &&
      this.address.length > 0 &&
      this.city !== null &&
      this.city.length > 0 &&
      this.countryName !== null &&
      this.countryName.length > 0 &&
      (this.addressType === AddressType.BILLING ||
        this.addressType === AddressType.SHIPPING)
    );
  }

  /**
   * Valider les données de l'adresse
   * @returns {Object} Résultat de validation
   */
  validate(): OrderAddressValidationResult {
    const errors: string[] = [];

    if (!this.orderId || this.orderId <= 0) {
      errors.push("Order ID is required and must be positive");
    }

    if (!this.addressType || this.addressType.trim().length === 0) {
      errors.push("Address type is required");
    }

    if (!this.firstName || this.firstName.trim().length === 0) {
      errors.push("First name is required");
    }

    if (!this.lastName || this.lastName.trim().length === 0) {
      errors.push("Last name is required");
    }

    if (!this.address || this.address.trim().length === 0) {
      errors.push("Address is required");
    }

    if (!this.city || this.city.trim().length === 0) {
      errors.push("City is required");
    }

    if (!this.countryName || this.countryName.trim().length === 0) {
      errors.push("Country name is required");
    }

    if (
      this.addressType &&
      !Object.values(AddressType).includes(this.addressType)
    ) {
      errors.push(
        `Address type must be one of: ${Object.values(AddressType).join(", ")}`
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

export default OrderAddress;
