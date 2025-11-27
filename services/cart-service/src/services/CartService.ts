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
import { CheckoutSnapshotRepository } from "../repositories/CheckoutSnapshotRepository";
import { Cart } from "../models/Cart";
import { CartMapper } from "../api/mapper/CartMapper";
import * as DTO from "@tfe/shared-types/cart-service";

export default class CartService {
  private cartRepository: CartRepository;
  private snapshotRepository: CheckoutSnapshotRepository;

  constructor() {
    this.cartRepository = new CartRepository();
    this.snapshotRepository = new CheckoutSnapshotRepository();
  }

  /**
   * Créer un nouveau panier (méthode interne)
   */
  private async createCart(sessionId: string): Promise<Cart> {
    const cartId = uuidv4();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 1 jour

    const cart = new Cart({
      id: cartId,
      session_id: sessionId,
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
      cart = await this.createCart(sessionId);
    }

    const cartItem = CartMapper.cartItemCreateDTOToCartItem(itemData, uuidv4());

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
   * Sauvegarder un snapshot checkout
   */
  async saveCheckoutSnapshot(
    cartSessionId: string,
    snapshot: any
  ): Promise<void> {
    await this.snapshotRepository.saveSnapshot(cartSessionId, snapshot);
  }

  /**
   * Récupérer un snapshot checkout
   */
  async getCheckoutSnapshot(cartSessionId: string): Promise<any | null> {
    return await this.snapshotRepository.getSnapshot(cartSessionId);
  }

  /**
   * Supprimer un snapshot checkout
   */
  async deleteCheckoutSnapshot(cartSessionId: string): Promise<void> {
    await this.snapshotRepository.deleteSnapshot(cartSessionId);
  }

  /**
   * Récupérer le panier et le snapshot checkout ensemble
   *
   * @param cartSessionId - Identifiant de session du panier
   * @returns Panier et snapshot formatés ensemble, ou null si l'un des deux est introuvable
   */
  async getCheckoutData(cartSessionId: string): Promise<{
    cart: Cart;
    snapshot: any;
  } | null> {
    const cart = await this.getCart(cartSessionId);
    if (!cart) {
      return null;
    }

    const snapshot = await this.getCheckoutSnapshot(cartSessionId);
    if (!snapshot) {
      return null;
    }

    return { cart, snapshot };
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
}
