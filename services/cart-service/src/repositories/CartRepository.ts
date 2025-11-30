/**
 * CartRepository
 * Repository pour la gestion des paniers avec Redis
 *
 * Architecture : Repository pattern
 * - Abstraction de la persistance
 * - Gestion Redis
 * - TTL et sessions
 */

import Redis from "ioredis";
import { Cart, CartData } from "../models/Cart";

export class CartRepository {
  private redis: Redis;
  private ttl: number;

  constructor() {
    const redisConfig: any = {
      host: process.env.REDIS_HOST || "localhost",
      port: parseInt(process.env.REDIS_PORT || "6379"),
      db: parseInt(process.env.REDIS_DB || "0"),
      maxRetriesPerRequest: 3,
    };

    if (process.env.REDIS_PASSWORD) {
      redisConfig.password = process.env.REDIS_PASSWORD;
    }

    this.redis = new Redis(redisConfig);

    // TTL fixe : 1 jour (86400 secondes)
    this.ttl = parseInt(process.env.CART_TTL || "86400");

    console.log("✅ Redis CartRepository initialized");
  }

  /**
   * Créer un panier
   */
  async createCart(cart: Cart): Promise<void> {
    const key = this.getCartKey(cart.sessionId);
    await this.redis.setex(
      key,
      this.ttl,
      JSON.stringify({
        id: cart.id,
        session_id: cart.sessionId,
        items: cart.items.map((item) => ({
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
        subtotal: cart.subtotal,
        tax: cart.tax,
        total: cart.total,
        checkout_data: cart.checkoutData || null,
        created_at: cart.createdAt,
        updated_at: cart.updatedAt,
        expires_at: cart.expiresAt,
      })
    );
  }

  /**
   * Récupérer un panier
   */
  async getCart(sessionId: string): Promise<Cart | null> {
    const key = this.getCartKey(sessionId);
    const data = await this.redis.get(key);

    if (!data) {
      return null;
    }

    try {
      const cartData = JSON.parse(data) as CartData;
      return new Cart(cartData);
    } catch (error) {
      console.error("Error parsing cart data:", error);
      return null;
    }
  }

  /**
   * Mettre à jour un panier
   */
  async updateCart(cart: Cart): Promise<void> {
    const key = this.getCartKey(cart.sessionId);
    const itemsToStore = cart.items.map((item) => ({
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
    }));
    await this.redis.setex(
      key,
      this.ttl,
      JSON.stringify({
        id: cart.id,
        session_id: cart.sessionId,
        items: itemsToStore,
        subtotal: cart.subtotal,
        tax: cart.tax,
        total: cart.total,
        checkout_data: cart.checkoutData || null,
        created_at: cart.createdAt,
        updated_at: cart.updatedAt,
        expires_at: cart.expiresAt,
      })
    );
  }

  /**
   * Supprimer un panier
   */
  async deleteCart(sessionId: string): Promise<void> {
    const key = this.getCartKey(sessionId);
    await this.redis.del(key);
  }

  /**
   * Vérifier si un panier existe
   */
  async cartExists(sessionId: string): Promise<boolean> {
    const key = this.getCartKey(sessionId);
    const exists = await this.redis.exists(key);
    return exists === 1;
  }

  /**
   * Obtenir les statistiques des paniers
   */
  async getCartStats(): Promise<any> {
    const sessionKeys = await this.redis.keys("cart:session:*");
    const userKeys = await this.redis.keys("cart:user:*");

    let totalCarts = 0;
    let totalValue = 0;
    let totalItems = 0;

    // Analyser les paniers de session
    for (const key of sessionKeys) {
      const data = await this.redis.get(key);
      if (data) {
        const cart = new Cart(JSON.parse(data));
        totalCarts++;
        totalValue += cart.total;
        totalItems += cart.items.reduce((sum, item) => sum + item.quantity, 0);
      }
    }

    // Analyser les paniers utilisateur
    for (const key of userKeys) {
      const data = await this.redis.get(key);
      if (data) {
        const cart = new Cart(JSON.parse(data));
        totalCarts++;
        totalValue += cart.total;
        totalItems += cart.items.reduce((sum, item) => sum + item.quantity, 0);
      }
    }

    return {
      totalCarts,
      activeCarts: sessionKeys.length + userKeys.length,
      averageCartValue: totalCarts > 0 ? totalValue / totalCarts : 0,
      totalItems,
      period: "current",
    };
  }

  /**
   * Nettoyer les paniers expirés
   */
  async cleanupExpiredCarts(): Promise<number> {
    const allKeys = await this.redis.keys("cart:*");
    let cleanedCount = 0;

    for (const key of allKeys) {
      const ttl = await this.redis.ttl(key);
      if (ttl === -1) {
        // Pas de TTL définie
        await this.redis.del(key);
        cleanedCount++;
      }
    }

    return cleanedCount;
  }

  /**
   * Obtenir la clé Redis pour un panier
   */
  private getCartKey(sessionId: string): string {
    return `cart:session:${sessionId}`;
  }
}
