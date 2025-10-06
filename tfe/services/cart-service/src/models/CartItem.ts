/**
 * CartItem Model
 * Modèle pour les articles du panier
 *
 * Architecture : Model pattern
 * - Représentation des données
 * - Validation métier
 * - Logique de calcul
 */

export interface CartItemData {
  id: string;
  product_id: number;
  quantity: number;
  price: number;
  added_at: Date;
}

export class CartItem {
  public readonly id: string;
  public readonly productId: number;
  public readonly quantity: number;
  public readonly price: number;
  public readonly addedAt: Date;

  constructor(data: CartItemData) {
    this.id = data.id;
    this.productId = data.product_id;
    this.quantity = data.quantity;
    this.price = data.price;
    this.addedAt = data.added_at;
  }

  /**
   * Calculer le total pour cet article
   */
  getTotal(): number {
    return this.price * this.quantity;
  }

  /**
   * Valider l'article
   */
  isValid(): boolean {
    return (
      this.id.length > 0 &&
      this.productId > 0 &&
      this.quantity > 0 &&
      this.price >= 0
    );
  }

  /**
   * Mettre à jour la quantité
   */
  updateQuantity(newQuantity: number): CartItem {
    if (newQuantity <= 0) {
      throw new Error("La quantité doit être positive");
    }

    return new CartItem({
      id: this.id,
      product_id: this.productId,
      quantity: newQuantity,
      price: this.price,
      added_at: this.addedAt,
    });
  }
}
