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
  id: number | null;
  customer_id: number | null;
  customer_snapshot: any | null;
  total_amount_ht: number;
  total_amount_ttc: number;
  payment_method: string;
  notes: string;
  created_at: Date | null;
  updated_at: Date | null;
}

/**
 * Résultat de validation de la commande
 */
export interface OrderValidationResult {
  isValid: boolean;
  errors: string[];
}

class Order {
  public readonly id: number | null;
  public readonly customerId: number | null;
  public readonly customerSnapshot: any | null;
  public readonly totalAmountHT: number;
  public readonly totalAmountTTC: number;
  public readonly paymentMethod: string;
  public readonly notes: string;
  public readonly createdAt: Date | null;
  public readonly updatedAt: Date | null;

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
      this.customerId !== null &&
      this.totalAmountHT >= 0 &&
      this.totalAmountTTC >= 0 &&
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

    if (!this.paymentMethod || this.paymentMethod.trim().length === 0) {
      errors.push("Payment method is required");
    }

    if (
      this.paymentMethod &&
      !["card", "paypal", "bank_transfer"].includes(this.paymentMethod)
    ) {
      errors.push("Payment method must be one of: card, paypal, bank_transfer");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

export default Order;
