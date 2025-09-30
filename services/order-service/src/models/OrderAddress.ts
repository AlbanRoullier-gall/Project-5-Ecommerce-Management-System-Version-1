/**
 * OrderAddress Model
 * Représente une adresse de commande dans le système
 *
 * Architecture : Modèle centré sur la base de données
 * - Correspond exactement à la table `order_addresses`
 * - Contient la logique métier de l'adresse de commande
 * - Validation et transformation des données
 */

/**
 * Interface correspondant exactement à la table order_addresses
 */
export interface OrderAddressData {
  id: number | null;
  order_id: number | null;
  address_type: string;
  address: string;
  postal_code: string;
  city: string;
  country_id: number | null;
  created_at: Date | null;
  updated_at: Date | null;
}

/**
 * Résultat de validation de l'adresse de commande
 */
export interface OrderAddressValidationResult {
  isValid: boolean;
  errors: string[];
}

class OrderAddress {
  public readonly id: number | null;
  public readonly orderId: number | null;
  public readonly addressType: string;
  public readonly address: string;
  public readonly postalCode: string;
  public readonly city: string;
  public readonly countryId: number | null;
  public readonly createdAt: Date | null;
  public readonly updatedAt: Date | null;

  constructor(data: OrderAddressData) {
    this.id = data.id;
    this.orderId = data.order_id;
    this.addressType = data.address_type;
    this.address = data.address;
    this.postalCode = data.postal_code;
    this.city = data.city;
    this.countryId = data.country_id;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  /**
   * Vérifier si l'adresse est valide
   */
  isValid(): boolean {
    return (
      this.orderId !== null &&
      this.addressType.length > 0 &&
      this.address.length > 0 &&
      this.postalCode.length > 0 &&
      this.city.length > 0
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

    if (!this.address || this.address.trim().length === 0) {
      errors.push("Address is required");
    }

    if (!this.postalCode || this.postalCode.trim().length === 0) {
      errors.push("Postal code is required");
    }

    if (!this.city || this.city.trim().length === 0) {
      errors.push("City is required");
    }

    if (
      this.addressType &&
      !["billing", "shipping"].includes(this.addressType)
    ) {
      errors.push("Address type must be 'billing' or 'shipping'");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

export default OrderAddress;
