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
import { CartMapper } from "../api/mapper/CartMapper";
import * as DTO from "@tfe/shared-types/cart-service";

export default class CartService {
  private cartRepository: CartRepository;

  constructor() {
    this.cartRepository = new CartRepository();
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
}
