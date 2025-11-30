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

/**
 * Données checkout temporaires associées au panier
 */
export interface CartCheckoutData {
  customerData?: {
    email: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
  } | null;
  addressData?: {
    shipping?: {
      address?: string;
      postalCode?: string;
      city?: string;
      countryName?: string;
    };
    billing?: {
      address?: string;
      postalCode?: string;
      city?: string;
      countryName?: string;
    };
    useSameBillingAddress?: boolean;
  } | null;
}

export interface CartData {
  id: string;
  session_id: string;
  items: any[];
  subtotal: number;
  tax: number;
  total: number;
  vat_breakdown?: Array<{ rate: number; amount: number }>; // Breakdown TVA par taux
  checkout_data?: CartCheckoutData | null; // Données checkout temporaires
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
  public readonly vatBreakdown: Array<{ rate: number; amount: number }>;
  public readonly checkoutData: CartCheckoutData | null;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;
  public readonly expiresAt: Date;

  constructor(data: CartData) {
    this.id = data.id;
    this.sessionId = data.session_id;
    const items = data.items.map((item) => new CartItem(item));
    this.items = items;
    this.subtotal = data.subtotal;
    this.tax = data.tax;
    this.total = data.total;
    // Calculer le breakdown si non fourni (pour compatibilité avec anciennes données)
    this.vatBreakdown = data.vat_breakdown || this.calculateVatBreakdown(items);
    this.checkoutData = data.checkout_data || null;
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
   * Mettre à jour les données checkout
   */
  updateCheckoutData(checkoutData: CartCheckoutData): Cart {
    return new Cart({
      id: this.id,
      session_id: this.sessionId,
      items: this.items.map((item) => ({
        id: item.id,
        product_id: item.productId,
        product_name: item.productName,
        description: item.description,
        image_url: item.imageUrl,
        quantity: item.quantity,
        vat_rate: item.vatRate,
        unit_price_ht: item.unitPriceHT,
        unit_price_ttc: item.unitPriceTTC,
        total_price_ht: item.totalPriceHT,
        total_price_ttc: item.totalPriceTTC,
        added_at: item.addedAt,
      })),
      subtotal: this.subtotal,
      tax: this.tax,
      total: this.total,
      vat_breakdown: this.vatBreakdown,
      checkout_data: checkoutData,
      created_at: this.createdAt,
      updated_at: new Date(),
      expires_at: this.expiresAt,
    });
  }

  /**
   * Supprimer les données checkout
   */
  clearCheckoutData(): Cart {
    return new Cart({
      id: this.id,
      session_id: this.sessionId,
      items: this.items.map((item) => ({
        id: item.id,
        product_id: item.productId,
        product_name: item.productName,
        description: item.description,
        image_url: item.imageUrl,
        quantity: item.quantity,
        vat_rate: item.vatRate,
        unit_price_ht: item.unitPriceHT,
        unit_price_ttc: item.unitPriceTTC,
        total_price_ht: item.totalPriceHT,
        total_price_ttc: item.totalPriceTTC,
        added_at: item.addedAt,
      })),
      subtotal: this.subtotal,
      tax: this.tax,
      total: this.total,
      vat_breakdown: this.vatBreakdown,
      checkout_data: null,
      created_at: this.createdAt,
      updated_at: new Date(),
      expires_at: this.expiresAt,
    });
  }

  /**
   * Calculer le breakdown de la TVA par taux
   * @param items Les articles du panier
   * @returns Tableau trié par taux croissant avec le montant de TVA pour chaque taux
   */
  private calculateVatBreakdown(
    items: CartItem[]
  ): Array<{ rate: number; amount: number }> {
    const vatByRate = new Map<number, number>();

    for (const item of items) {
      const rate = item.vatRate ?? 0;
      const lineTotalTTC = item.totalPriceTTC;
      const lineTotalHT = item.totalPriceHT;
      const vat = lineTotalTTC - lineTotalHT;

      vatByRate.set(rate, (vatByRate.get(rate) || 0) + vat);
    }

    // Trier par taux croissant et arrondir les montants
    return Array.from(vatByRate.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([rate, amount]) => ({
        rate,
        amount: Math.round(amount * 100) / 100,
      }));
  }

  /**
   * Créer un nouveau panier avec les articles donnés
   */
  private createCartWithItems(items: CartItem[]): Cart {
    // Utiliser les prix stockés directement (plus besoin de calculer)
    const lineTotalsTTC = items.map((item) => item.totalPriceTTC);
    const lineTotalsHT = items.map((item) => item.totalPriceHT);

    const totalTTC = lineTotalsTTC.reduce((sum, v) => sum + v, 0);
    const subtotalHT = lineTotalsHT.reduce((sum, v) => sum + v, 0);
    const tax = totalTTC - subtotalHT;

    // Arrondir à 2 décimales de manière cohérente
    const subtotal = Math.round(subtotalHT * 100) / 100;
    const total = Math.round(totalTTC * 100) / 100;
    const taxRounded = Math.round(tax * 100) / 100;

    // Calculer le breakdown TVA
    const vatBreakdown = this.calculateVatBreakdown(items);

    return new Cart({
      id: this.id,
      session_id: this.sessionId,
      items: items.map((item) => ({
        id: item.id,
        product_id: item.productId,
        product_name: item.productName,
        description: item.description,
        image_url: item.imageUrl,
        quantity: item.quantity,
        vat_rate: item.vatRate,
        unit_price_ht: item.unitPriceHT,
        unit_price_ttc: item.unitPriceTTC,
        total_price_ht: item.totalPriceHT,
        total_price_ttc: item.totalPriceTTC,
        added_at: item.addedAt,
      })),
      subtotal,
      tax: taxRounded,
      total,
      vat_breakdown: vatBreakdown,
      checkout_data: this.checkoutData,
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
}
