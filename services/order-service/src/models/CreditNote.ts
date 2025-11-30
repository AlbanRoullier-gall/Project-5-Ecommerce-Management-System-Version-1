/**
 * CreditNote Model
 * Représente un avoir dans le système
 *
 * Architecture : Modèle centré sur la base de données
 * - Correspond exactement à la table `credit_notes`
 * - Contient la logique métier de l'avoir
 * - Validation et transformation des données
 */

/**
 * Interface correspondant exactement à la table credit_notes
 */
export interface CreditNoteData {
  id: number;
  customer_id: number;
  order_id: number;
  total_amount_ht: number;
  total_amount_ttc: number;
  reason: string;
  description: string | null;
  issue_date: Date | null;
  payment_method: string;
  notes: string | null;
  status?: string;
  created_at: Date;
  updated_at: Date;
}

/**
 * Résultat de validation de l'avoir
 */
export interface CreditNoteValidationResult {
  isValid: boolean;
  errors: string[];
}

class CreditNote {
  public readonly id: number;
  public readonly customerId: number;
  public readonly orderId: number;
  public readonly totalAmountHT: number;
  public readonly totalAmountTTC: number;
  public readonly reason: string;
  public readonly description: string | null;
  public readonly issueDate: Date | null;
  public readonly paymentMethod: string;
  public readonly notes: string | null;
  public readonly status: string;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(data: CreditNoteData) {
    this.id = data.id;
    this.customerId = data.customer_id;
    this.orderId = data.order_id;
    this.totalAmountHT = data.total_amount_ht;
    this.totalAmountTTC = data.total_amount_ttc;
    this.reason = data.reason;
    this.description = data.description;
    this.issueDate = data.issue_date;
    this.paymentMethod = data.payment_method;
    this.notes = data.notes;
    this.status = data.status || "pending";
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  /**
   * Calculer les totaux de l'avoir
   */
  calculateTotals(): { totalHT: number; totalTTC: number; totalVAT: number } {
    return {
      totalHT: this.totalAmountHT,
      totalTTC: this.totalAmountTTC,
      totalVAT: this.totalAmountTTC - this.totalAmountHT,
    };
  }

  /**
   * Calculer les totaux HT et TTC à partir d'une liste d'items
   * Méthode statique pour calculer les totaux depuis des items (réutilisable)
   * @param {Array} items Liste d'items avec totalPriceHT et totalPriceTTC
   * @param {number} fallbackHT Total HT par défaut si pas d'items (optionnel)
   * @param {number} fallbackTTC Total TTC par défaut si pas d'items (optionnel)
   * @returns {{totalHT: number, totalTTC: number}} Totaux calculés
   */
  static calculateTotalsFromItems(
    items: Array<{
      totalPriceHT: number;
      totalPriceTTC: number;
    }>,
    fallbackHT: number = 0,
    fallbackTTC: number = 0
  ): { totalHT: number; totalTTC: number } {
    if (!items || items.length === 0) {
      return {
        totalHT: Number(fallbackHT) || 0,
        totalTTC: Number(fallbackTTC) || 0,
      };
    }

    const totalHT = items.reduce(
      (sum, item) => sum + parseFloat(String(item.totalPriceHT || 0)),
      0
    );
    const totalTTC = items.reduce(
      (sum, item) => sum + parseFloat(String(item.totalPriceTTC || 0)),
      0
    );

    return {
      totalHT: isNaN(totalHT) ? 0 : Number(totalHT),
      totalTTC: isNaN(totalTTC) ? 0 : Number(totalTTC),
    };
  }

  /**
   * Vérifier si l'avoir est valide
   */
  isValid(): boolean {
    return (
      this.customerId > 0 &&
      this.orderId > 0 &&
      this.totalAmountHT >= 0 &&
      this.totalAmountTTC >= 0 &&
      this.reason.length > 0
    );
  }

  /**
   * Vérifier si l'avoir est remboursé
   */
  isRefunded(): boolean {
    return this.status === "refunded";
  }

  /**
   * Vérifier si l'avoir est en attente de remboursement
   */
  isPending(): boolean {
    return this.status === "pending";
  }

  /**
   * Valider les données de l'avoir
   * @returns {Object} Résultat de validation
   */
  validate(): CreditNoteValidationResult {
    const errors: string[] = [];

    if (!this.customerId || this.customerId <= 0) {
      errors.push("Customer ID is required and must be positive");
    }

    if (!this.orderId || this.orderId <= 0) {
      errors.push("Order ID is required and must be positive");
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

    if (!this.reason || this.reason.trim().length === 0) {
      errors.push("Reason is required");
    }

    if (!this.paymentMethod || this.paymentMethod.trim().length === 0) {
      errors.push("Payment method is required");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

export default CreditNote;
