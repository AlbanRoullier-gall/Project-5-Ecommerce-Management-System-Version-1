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
  product_name: string; // Requis et non vide - snapshot au moment de l'ajout
  description?: string | null; // Description du produit (snapshot au moment de l'ajout)
  image_url?: string | null; // URL de la première image du produit (snapshot au moment de l'ajout)
  quantity: number;
  vat_rate: number;
  unit_price_ht: number; // Prix unitaire HT (stocké pour cohérence avec order-service)
  unit_price_ttc: number; // Prix unitaire TTC (stocké pour cohérence avec order-service)
  total_price_ht: number; // Total HT (stocké pour cohérence avec order-service)
  total_price_ttc: number; // Total TTC (stocké pour cohérence avec order-service)
  added_at: Date; // Gardé en DB pour compatibilité, mappé vers createdAt dans DTO
}

export class CartItem {
  public readonly id: string;
  public readonly productId: number;
  public readonly productName: string; // Requis et non vide
  public readonly description?: string | null;
  public readonly imageUrl?: string | null;
  public readonly quantity: number;
  public readonly vatRate: number;
  public readonly unitPriceHT: number; // Prix unitaire HT (stocké)
  public readonly unitPriceTTC: number; // Prix unitaire TTC (stocké)
  public readonly totalPriceHT: number; // Total HT (stocké)
  public readonly totalPriceTTC: number; // Total TTC (stocké)
  public readonly addedAt: Date; // Gardé pour compatibilité DB, mappé vers createdAt dans DTO

  constructor(data: CartItemData) {
    this.id = data.id;
    this.productId = data.product_id;
    this.productName = data.product_name || ""; // Garantir une valeur non vide
    this.description = data.description ?? null;
    this.imageUrl = data.image_url ?? null;
    this.quantity = data.quantity;
    this.vatRate = data.vat_rate;
    this.addedAt = data.added_at;

    // Utiliser directement les valeurs stockées (obligatoires)
    this.unitPriceHT = data.unit_price_ht;
    this.unitPriceTTC = data.unit_price_ttc;
    this.totalPriceHT = data.total_price_ht;
    this.totalPriceTTC = data.total_price_ttc;
  }

  /**
   * Valider l'article
   */
  isValid(): boolean {
    return (
      this.id.length > 0 &&
      this.productId > 0 &&
      this.productName.trim().length > 0 && // ProductName requis et non vide
      this.quantity > 0 &&
      this.unitPriceTTC >= 0 &&
      this.unitPriceHT >= 0 &&
      this.totalPriceHT >= 0 &&
      this.totalPriceTTC >= 0
    );
  }

  /**
   * Mettre à jour la quantité
   */
  updateQuantity(newQuantity: number): CartItem {
    if (newQuantity <= 0) {
      throw new Error("La quantité doit être positive");
    }

    // Recalculer les totaux avec la nouvelle quantité
    const newTotalPriceHT = this.unitPriceHT * newQuantity;
    const newTotalPriceTTC = this.unitPriceTTC * newQuantity;

    const itemData: CartItemData = {
      id: this.id,
      product_id: this.productId,
      product_name: this.productName, // Toujours requis
      quantity: newQuantity,
      vat_rate: this.vatRate,
      unit_price_ht: this.unitPriceHT,
      unit_price_ttc: this.unitPriceTTC,
      total_price_ht: newTotalPriceHT,
      total_price_ttc: newTotalPriceTTC,
      added_at: this.addedAt,
      description: this.description ?? null,
      image_url: this.imageUrl ?? null,
    };
    return new CartItem(itemData);
  }
}
