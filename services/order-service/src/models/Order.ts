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
   * Calculer les totaux HT et TTC à partir d'une liste d'items de commande
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
}

export default Order;
