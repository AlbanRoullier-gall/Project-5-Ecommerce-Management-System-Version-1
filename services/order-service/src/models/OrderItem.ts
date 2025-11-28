/**
 * OrderItem Model
 * Représente un article de commande dans le système
 *
 * Architecture : Modèle centré sur la base de données
 * - Correspond exactement à la table `order_items`
 * - Contient la logique métier de l'article
 * - Validation et transformation des données
 */

/**
 * Interface correspondant exactement à la table order_items
 * Harmonisé avec CartItemData pour assurer la cohérence des données
 */
export interface OrderItemData {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string; // Requis et non vide
  description?: string | null; // Snapshot du produit
  image_url?: string | null; // Snapshot de l'image
  quantity: number;
  unit_price_ht: number;
  unit_price_ttc: number;
  vat_rate: number;
  total_price_ht: number;
  total_price_ttc: number;
  created_at: Date;
  updated_at: Date;
}

class OrderItem {
  public readonly id: number;
  public readonly orderId: number;
  public readonly productId: number;
  public readonly productName: string; // Requis et non vide
  public readonly description?: string | null;
  public readonly imageUrl?: string | null;
  public readonly quantity: number;
  public readonly unitPriceHT: number;
  public readonly unitPriceTTC: number;
  public readonly vatRate: number;
  public readonly totalPriceHT: number;
  public readonly totalPriceTTC: number;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(data: OrderItemData) {
    this.id = data.id;
    this.orderId = data.order_id;
    this.productId = data.product_id;
    this.productName = data.product_name || ""; // Garantir une valeur par défaut
    this.description = data.description ?? null;
    this.imageUrl = data.image_url ?? null;
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
   * Vérifier si l'article est valide
   */
  isValid(): boolean {
    return (
      this.orderId !== null &&
      this.orderId > 0 &&
      this.productId !== null &&
      this.productId > 0 &&
      this.productName.trim().length > 0 && // ProductName requis et non vide
      this.quantity > 0 &&
      this.unitPriceHT >= 0 &&
      this.unitPriceTTC >= 0 &&
      this.unitPriceTTC >= this.unitPriceHT
    );
  }
}

export default OrderItem;
