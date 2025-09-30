/**
 * CreditNoteItem Model
 * Représente un article d'avoir dans le système
 *
 * Architecture : Modèle centré sur la base de données
 * - Correspond exactement à la table `credit_note_items`
 * - Contient la logique métier de l'article d'avoir
 * - Validation et transformation des données
 */

/**
 * Interface correspondant exactement à la table credit_note_items
 */
export interface CreditNoteItemData {
  id: number | null;
  credit_note_id: number | null;
  product_id: number | null;
  quantity: number;
  unit_price_ht: number;
  unit_price_ttc: number;
  vat_rate: number;
  total_price_ht: number;
  total_price_ttc: number;
  created_at: Date | null;
  updated_at: Date | null;
}

/**
 * Résultat de validation de l'article d'avoir
 */
export interface CreditNoteItemValidationResult {
  isValid: boolean;
  errors: string[];
}

class CreditNoteItem {
  public readonly id: number | null;
  public readonly creditNoteId: number | null;
  public readonly productId: number | null;
  public readonly quantity: number;
  public readonly unitPriceHT: number;
  public readonly unitPriceTTC: number;
  public readonly vatRate: number;
  public readonly totalPriceHT: number;
  public readonly totalPriceTTC: number;
  public readonly createdAt: Date | null;
  public readonly updatedAt: Date | null;

  constructor(data: CreditNoteItemData) {
    this.id = data.id;
    this.creditNoteId = data.credit_note_id;
    this.productId = data.product_id;
    this.quantity = data.quantity;
    this.unitPriceHT = data.unit_price_ht;
    this.unitPriceTTC = data.unit_price_ttc;
    this.vatRate = data.vat_rate;
    this.totalPriceHT = data.total_price_ht;
    this.totalPriceTTC = data.total_price_ttc;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  /**
   * Calculer le prix total HT
   */
  calculateTotalHT(): number {
    return this.unitPriceHT * this.quantity;
  }

  /**
   * Calculer le prix total TTC
   */
  calculateTotalTTC(): number {
    return this.unitPriceTTC * this.quantity;
  }

  /**
   * Vérifier si l'article d'avoir est valide
   */
  isValid(): boolean {
    return (
      this.creditNoteId !== null &&
      this.productId !== null &&
      this.quantity > 0 &&
      this.unitPriceHT >= 0 &&
      this.unitPriceTTC >= 0
    );
  }

  /**
   * Valider les données de l'article d'avoir
   * @returns {Object} Résultat de validation
   */
  validate(): CreditNoteItemValidationResult {
    const errors: string[] = [];

    if (!this.creditNoteId || this.creditNoteId <= 0) {
      errors.push("Credit note ID is required and must be positive");
    }

    if (!this.productId || this.productId <= 0) {
      errors.push("Product ID is required and must be positive");
    }

    if (this.quantity <= 0) {
      errors.push("Quantity must be positive");
    }

    if (this.unitPriceHT < 0) {
      errors.push("Unit price HT must be non-negative");
    }

    if (this.unitPriceTTC < 0) {
      errors.push("Unit price TTC must be non-negative");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

export default CreditNoteItem;
