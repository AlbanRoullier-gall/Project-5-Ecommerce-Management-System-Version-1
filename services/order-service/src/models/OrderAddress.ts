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
  address_snapshot: any;
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
  public readonly addressSnapshot: any;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(data: OrderAddressData) {
    this.id = data.id;
    this.orderId = data.order_id;
    this.addressType = data.address_type;
    this.addressSnapshot = data.address_snapshot;
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
      this.addressSnapshot !== null &&
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

    if (!this.addressSnapshot || typeof this.addressSnapshot !== "object") {
      errors.push("Address snapshot is required and must be an object");
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
