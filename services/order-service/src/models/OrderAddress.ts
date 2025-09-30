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
  address_snapshot: any;
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
  public readonly addressSnapshot: any;
  public readonly createdAt: Date | null;
  public readonly updatedAt: Date | null;

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
      this.orderId !== null &&
      this.addressType.length > 0 &&
      this.addressSnapshot !== null
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
