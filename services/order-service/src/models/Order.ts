/**
 * Order Model
 * Représente une commande dans le système
 *
 * Architecture : Modèle centré sur la base de données
 * - Correspond exactement à la table `orders`
 * - Contient la logique métier de la commande
 * - Validation et transformation des données
 */

/**
 * Interface correspondant exactement à la table orders
 */
export interface OrderData {
  id: number;
  customer_id: number;
  customer_snapshot: any | null;
  total_amount_ht: number;
  total_amount_ttc: number;
  payment_method: string | null;
  notes: string | null;
  delivered: boolean;
  created_at: Date;
  updated_at: Date;
}

/**
 * Résultat de validation de la commande
 */
export interface OrderValidationResult {
  isValid: boolean;
  errors: string[];
}

class Order {
  public readonly id: number;
  public readonly customerId: number;
  public readonly customerSnapshot: any | null;
  public readonly totalAmountHT: number;
  public readonly totalAmountTTC: number;
  public readonly paymentMethod: string | null;
  public readonly notes: string | null;
  public readonly delivered: boolean;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  // Additional fields for joins
  public customerFirstName?: string;
  public customerLastName?: string;
  public customerEmail?: string;

  constructor(data: OrderData) {
    this.id = data.id;
    this.customerId = data.customer_id;
    this.customerSnapshot = data.customer_snapshot;
    this.totalAmountHT = data.total_amount_ht;
    this.totalAmountTTC = data.total_amount_ttc;
    this.paymentMethod = data.payment_method;
    this.notes = data.notes;
    this.delivered = data.delivered;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  /**
   * Calculer les totaux de la commande
   */
  calculateTotals(): { totalHT: number; totalTTC: number; totalVAT: number } {
    return {
      totalHT: this.totalAmountHT,
      totalTTC: this.totalAmountTTC,
      totalVAT: this.totalAmountTTC - this.totalAmountHT,
    };
  }

  /**
   * Vérifier si la commande est valide
   */
  isValid(): boolean {
    return (
      this.customerId > 0 &&
      this.totalAmountHT >= 0 &&
      this.totalAmountTTC >= 0 &&
      this.totalAmountTTC >= this.totalAmountHT &&
      this.paymentMethod !== null &&
      this.paymentMethod.length > 0
    );
  }

  /**
   * Valider les données de la commande
   * @returns {Object} Résultat de validation
   */
  validate(): OrderValidationResult {
    const errors: string[] = [];

    if (!this.customerId || this.customerId <= 0) {
      errors.push("Customer ID is required and must be positive");
    }

    if (this.totalAmountHT < 0) {
      errors.push("Total amount HT must be non-negative");
    }

    if (this.totalAmountTTC < 0) {
      errors.push("Total amount TTC must be non-negative");
    }

    if (this.totalAmountTTC < this.totalAmountHT) {
      errors.push(
        "Total amount TTC must be greater than or equal to total amount HT"
      );
    }

    if (!this.paymentMethod) {
      errors.push("Payment method is required");
    }

    if (this.paymentMethod && this.paymentMethod.trim().length === 0) {
      errors.push("Payment method cannot be empty");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

export default Order;
