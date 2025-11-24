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
  product_name?: string; // Nom du produit (snapshot au moment de l'ajout)
  description?: string; // Description du produit (snapshot au moment de l'ajout)
  image_url?: string; // URL de la première image du produit (snapshot au moment de l'ajout)
  quantity: number;
  vat_rate: number;
  unit_price_ht: number; // Prix unitaire HT (stocké pour cohérence avec order-service)
  unit_price_ttc: number; // Prix unitaire TTC (stocké pour cohérence avec order-service)
  total_price_ht: number; // Total HT (stocké pour cohérence avec order-service)
  total_price_ttc: number; // Total TTC (stocké pour cohérence avec order-service)
  added_at: Date;
}

export class CartItem {
  public readonly id: string;
  public readonly productId: number;
  public readonly productName: string | undefined;
  public readonly description: string | undefined;
  public readonly imageUrl: string | undefined;
  public readonly quantity: number;
  public readonly vatRate: number;
  public readonly unitPriceHT: number; // Prix unitaire HT (stocké)
  public readonly unitPriceTTC: number; // Prix unitaire TTC (stocké)
  public readonly totalPriceHT: number; // Total HT (stocké)
  public readonly totalPriceTTC: number; // Total TTC (stocké)
  public readonly addedAt: Date;

  constructor(data: CartItemData) {
    this.id = data.id;
    this.productId = data.product_id;
    this.productName = data.product_name;
    this.description = data.description;
    this.imageUrl = data.image_url;
    this.quantity = data.quantity;
    this.vatRate = data.vat_rate;
    this.addedAt = data.added_at;

    // Utiliser directement les valeurs stockées (obligatoires)
    this.unitPriceHT = data.unit_price_ht;
    this.unitPriceTTC = data.unit_price_ttc;
    this.totalPriceHT = data.total_price_ht;
    this.totalPriceTTC = data.total_price_ttc;

    // Debug: vérifier si imageUrl est présent
    if (data.id && !this.imageUrl && data.image_url === undefined) {
      console.log("⚠️ CartItem créé sans imageUrl:", {
        id: this.id,
        productId: this.productId,
        productName: this.productName,
        image_url: data.image_url,
        data: data,
      });
    }
  }

  /**
   * Calculer le total pour cet article (alias pour totalPriceTTC)
   */
  getTotal(): number {
    return this.totalPriceTTC;
  }

  /**
   * Prix unitaire HT (retourne la valeur stockée)
   */
  getUnitPriceHT(): number {
    return this.unitPriceHT;
  }

  /**
   * Prix unitaire TTC (retourne la valeur stockée)
   */
  getUnitPriceTTC(): number {
    return this.unitPriceTTC;
  }

  /**
   * Total HT (retourne la valeur stockée)
   */
  getTotalHT(): number {
    return this.totalPriceHT;
  }

  /**
   * Total TTC (retourne la valeur stockée)
   */
  getTotalTTC(): number {
    return this.totalPriceTTC;
  }

  /**
   * Valider l'article
   */
  isValid(): boolean {
    return (
      this.id.length > 0 &&
      this.productId > 0 &&
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
      quantity: newQuantity,
      vat_rate: this.vatRate,
      unit_price_ht: this.unitPriceHT,
      unit_price_ttc: this.unitPriceTTC,
      total_price_ht: newTotalPriceHT,
      total_price_ttc: newTotalPriceTTC,
      added_at: this.addedAt,
    };
    if (this.productName !== undefined) {
      itemData.product_name = this.productName;
    }
    if (this.description !== undefined) {
      itemData.description = this.description;
    }
    if (this.imageUrl !== undefined) {
      itemData.image_url = this.imageUrl;
    }
    return new CartItem(itemData);
  }
}
