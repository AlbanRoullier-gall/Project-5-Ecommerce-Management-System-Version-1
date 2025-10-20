/**
 * CartService
 * Business logic layer pour la gestion des paniers
 *
 * Architecture : Service pattern
 * - Logique métier centralisée
 * - Orchestration des repositories
 * - Gestion des événements
 */

import { v4 as uuidv4 } from "uuid";
import { CartRepository } from "../repositories/CartRepository";
import { Cart } from "../models/Cart";
import { CartItem } from "../models/CartItem";
import * as DTO from "@tfe/shared-types/cart-service";

export default class CartService {
  private cartRepository: CartRepository;

  constructor() {
    this.cartRepository = new CartRepository();
  }

  /**
   * Créer un nouveau panier
   */
  async createCart(cartData: DTO.CartCreateDTO): Promise<Cart> {
    const cartId = uuidv4();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 1 jour

    const cart = new Cart({
      id: cartId,
      session_id: cartData.sessionId,
      items: [],
      subtotal: 0,
      tax: 0,
      total: 0,
      created_at: now,
      updated_at: now,
      expires_at: expiresAt,
    });

    await this.cartRepository.createCart(cart);
    return cart;
  }

  /**
   * Récupérer un panier
   */
  async getCart(sessionId: string): Promise<Cart | null> {
    return await this.cartRepository.getCart(sessionId);
  }

  /**
   * Ajouter un article au panier
   */
  async addItem(
    sessionId: string,
    itemData: DTO.CartItemCreateDTO
  ): Promise<Cart> {
    let cart = await this.getCart(sessionId);

    if (!cart) {
      cart = await this.createCart({ sessionId });
    }

    const cartItem = new CartItem({
      id: uuidv4(),
      product_id: itemData.productId,
      quantity: itemData.quantity,
      price: itemData.price,
      vat_rate: (itemData as any).vatRate ?? 0,
      added_at: new Date(),
    });

    const updatedCart = cart.addItem(cartItem);
    await this.cartRepository.updateCart(updatedCart);

    return updatedCart;
  }

  /**
   * Mettre à jour la quantité d'un article
   */
  async updateItemQuantity(
    sessionId: string,
    productId: number,
    quantity: number
  ): Promise<Cart> {
    const cart = await this.getCart(sessionId);
    if (!cart) {
      throw new Error("Panier non trouvé");
    }

    const updatedCart = cart.updateItemQuantity(productId, quantity);
    await this.cartRepository.updateCart(updatedCart);

    return updatedCart;
  }

  /**
   * Supprimer un article du panier
   */
  async removeItem(sessionId: string, productId: number): Promise<Cart> {
    const cart = await this.getCart(sessionId);
    if (!cart) {
      throw new Error("Panier non trouvé");
    }

    const updatedCart = cart.removeItem(productId);
    await this.cartRepository.updateCart(updatedCart);

    return updatedCart;
  }

  /**
   * Vider le panier
   */
  async clearCart(sessionId: string): Promise<Cart> {
    const cart = await this.getCart(sessionId);
    if (!cart) {
      throw new Error("Panier non trouvé");
    }

    const clearedCart = cart.clear();
    await this.cartRepository.updateCart(clearedCart);

    return clearedCart;
  }

  /**
   * Valider un panier
   */
  async validateCart(sessionId: string): Promise<any> {
    const cart = await this.getCart(sessionId);
    if (!cart) {
      return { isValid: false, errors: ["Panier non trouvé"] };
    }

    const errors: string[] = [];

    if (cart.isEmpty()) {
      errors.push("Le panier est vide");
    }

    if (cart.isExpired()) {
      errors.push("Le panier a expiré");
    }

    if (!cart.isValid()) {
      errors.push("Le panier contient des données invalides");
    }

    return {
      isValid: errors.length === 0,
      errors,
      cart: cart,
    };
  }

  /**
   * Obtenir les statistiques des paniers
   */
  async getCartStats(): Promise<any> {
    return await this.cartRepository.getCartStats();
  }

  /**
   * Nettoyer les paniers expirés
   */
  async cleanupExpiredCarts(): Promise<number> {
    const cleanedCount = await this.cartRepository.cleanupExpiredCarts();
    return cleanedCount;
  }

  /**
   * Vérifier la configuration Redis
   */
  getConfigurationStatus(): any {
    return {
      redisConfigured: !!this.cartRepository,
      redisHost: process.env.REDIS_HOST || "localhost",
      redisPort: process.env.REDIS_PORT || "6379",
    };
  }

  // ===== CHECKOUT SNAPSHOT & CHECKOUT SESSION MAPPING =====

  async attachCheckoutSnapshot(
    sessionId: string,
    snapshot: any
  ): Promise<void> {
    await this.cartRepository.setCheckoutSnapshot(sessionId, snapshot);
  }

  async getCheckoutSnapshot(sessionId: string): Promise<any | null> {
    return await this.cartRepository.getCheckoutSnapshot(sessionId);
  }

  // REMOVED: any Stripe-specific mapping. The cart-service stays Stripe-agnostic.
}
