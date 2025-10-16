/**
 * Cart Model
 * Modèle pour le panier
 *
 * Architecture : Model pattern
 * - Représentation des données
 * - Validation métier
 * - Logique de calcul
 */

import { CartItem } from "./CartItem";

export interface CartData {
  id: string;
  session_id: string;
  items: any[];
  subtotal: number;
  tax: number;
  total: number;
  created_at: Date;
  updated_at: Date;
  expires_at: Date;
}

export class Cart {
  public readonly id: string;
  public readonly sessionId: string;
  public readonly items: CartItem[];
  public readonly subtotal: number;
  public readonly tax: number;
  public readonly total: number;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;
  public readonly expiresAt: Date;

  constructor(data: CartData) {
    this.id = data.id;
    this.sessionId = data.session_id;
    this.items = data.items.map((item) => new CartItem(item));
    this.subtotal = data.subtotal;
    this.tax = data.tax;
    this.total = data.total;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
    this.expiresAt = data.expires_at;
  }

  /**
   * Ajouter un article au panier
   */
  addItem(item: CartItem): Cart {
    const existingItemIndex = this.items.findIndex(
      (existingItem) => existingItem.productId === item.productId
    );

    let newItems: CartItem[];

    if (existingItemIndex >= 0) {
      // Mettre à jour la quantité si l'article existe déjà
      newItems = [...this.items];
      const existingItem = newItems[existingItemIndex];
      if (existingItem) {
        newItems[existingItemIndex] = existingItem.updateQuantity(
          existingItem.quantity + item.quantity
        );
      }
    } else {
      // Ajouter un nouvel article
      newItems = [...this.items, item];
    }

    return this.createCartWithItems(newItems);
  }

  /**
   * Supprimer un article du panier
   */
  removeItem(productId: number): Cart {
    const itemIndex = this.items.findIndex(
      (item) => item.productId === productId
    );
    if (itemIndex === -1) {
      throw new Error(`Article avec productId ${productId} non trouvé`);
    }

    const newItems = this.items.filter((item) => item.productId !== productId);
    return this.createCartWithItems(newItems);
  }

  /**
   * Mettre à jour la quantité d'un article
   */
  updateItemQuantity(productId: number, quantity: number): Cart {
    if (quantity <= 0) {
      return this.removeItem(productId);
    }

    const itemIndex = this.items.findIndex(
      (item) => item.productId === productId
    );
    if (itemIndex === -1) {
      throw new Error(`Article avec productId ${productId} non trouvé`);
    }

    const newItems = this.items.map((item) =>
      item.productId === productId ? item.updateQuantity(quantity) : item
    );

    return this.createCartWithItems(newItems);
  }

  /**
   * Vider le panier
   */
  clear(): Cart {
    return this.createCartWithItems([]);
  }

  /**
   * Créer un nouveau panier avec les articles donnés
   */
  private createCartWithItems(items: CartItem[]): Cart {
    // Interpréter item.price comme un prix TTC unitaire
    // Calculer par ligne avec le taux de TVA propre à chaque article
    const lineTotalsTTC = items.map((item) => item.getTotal());
    const lineTotalsHT = items.map((item) => item.getTotalHT());

    const totalTTC = lineTotalsTTC.reduce((sum, v) => sum + v, 0);
    const subtotalHT = lineTotalsHT.reduce((sum, v) => sum + v, 0);
    const tax = totalTTC - subtotalHT;

    // Arrondir à 2 décimales de manière cohérente
    const subtotal = Math.round(subtotalHT * 100) / 100;
    const total = Math.round(totalTTC * 100) / 100;
    const taxRounded = Math.round(tax * 100) / 100;

    return new Cart({
      id: this.id,
      session_id: this.sessionId,
      items: items.map((item) => ({
        id: item.id,
        product_id: item.productId,
        quantity: item.quantity,
        price: item.price,
        vat_rate: item.vatRate,
        added_at: item.addedAt,
      })),
      subtotal,
      tax: taxRounded,
      total,
      created_at: this.createdAt,
      updated_at: new Date(),
      expires_at: this.expiresAt,
    });
  }

  /**
   * Vérifier si le panier est valide
   */
  isValid(): boolean {
    return (
      this.id.length > 0 &&
      this.sessionId.length > 0 &&
      this.items.every((item) => item.isValid()) &&
      this.total >= 0
    );
  }

  /**
   * Vérifier si le panier est vide
   */
  isEmpty(): boolean {
    return this.items.length === 0;
  }

  /**
   * Obtenir le nombre total d'articles
   */
  getTotalItems(): number {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  /**
   * Vérifier si le panier a expiré
   */
  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }
}
