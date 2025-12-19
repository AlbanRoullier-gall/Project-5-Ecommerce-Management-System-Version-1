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
import { Cart, CartCheckoutData } from "../models/Cart";
import { CartMapper } from "../api/mapper/CartMapper";
import * as DTO from "../../shared-types/cart-service";
import { API_GATEWAY_URL } from "../config";

export default class CartService {
  private cartRepository: CartRepository;

  constructor() {
    this.cartRepository = new CartRepository();
  }

  /**
   * Créer un nouveau panier
   */
  async createCart(sessionId: string): Promise<Cart> {
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
   * Récupérer un panier ou en créer un nouveau s'il n'existe pas
   * Utile pour retourner toujours un panier valide au frontend
   */
  async getOrCreateCart(sessionId: string): Promise<Cart> {
    let cart = await this.getCart(sessionId);
    if (!cart) {
      cart = await this.createCart(sessionId);
    }
    return cart;
  }

  /**
   * Vérifier le stock disponible d'un produit via l'API Gateway
   */
  private async checkProductStock(
    productId: number,
    requestedQuantity: number
  ): Promise<void> {
    try {
      const response = await fetch(
        `${API_GATEWAY_URL}/api/stock/check/${productId}?quantity=${requestedQuantity}`,
        {
          headers: {
            "X-Service-Request": "cart-service",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData.error || `Erreur lors de la vérification du stock`;
        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (!data.success || !data.data) {
        throw new Error(
          data.error || "Erreur lors de la vérification du stock"
        );
      }

      // Vérifier si le stock est disponible
      if (!data.data.isAvailable) {
        throw new Error(data.data.message || "Stock insuffisant");
      }
    } catch (error: any) {
      if (
        error.message.includes("Stock insuffisant") ||
        error.message.includes("plus disponible") ||
        error.message.includes("n'est plus disponible")
      ) {
        throw error;
      }
      // En cas d'erreur de réseau, on laisse passer (le payment-handler validera à nouveau)
      console.warn(
        `Impossible de vérifier le stock pour le produit ${productId}:`,
        error.message
      );
    }
  }

  /**
   * Ajouter un article au panier
   */
  async addItem(
    sessionId: string,
    itemData: DTO.CartItemCreateDTO
  ): Promise<Cart> {
    // Vérifier le stock avant d'ajouter
    await this.checkProductStock(itemData.productId, itemData.quantity);

    let cart = await this.getCart(sessionId);

    if (!cart) {
      cart = await this.createCart(sessionId);
    }

    // Vérifier si l'article existe déjà dans le panier
    const existingItem = cart.items.find(
      (item) => item.productId === itemData.productId
    );
    if (existingItem) {
      // Si l'article existe, vérifier le stock total (quantité existante + nouvelle quantité)
      const totalQuantity = existingItem.quantity + itemData.quantity;
      await this.checkProductStock(itemData.productId, totalQuantity);
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
    // Vérifier le stock avant de mettre à jour
    await this.checkProductStock(productId, quantity);

    // Récupérer ou créer le panier si nécessaire
    const cart = await this.getOrCreateCart(sessionId);

    const updatedCart = cart.updateItemQuantity(productId, quantity);
    await this.cartRepository.updateCart(updatedCart);

    return updatedCart;
  }

  /**
   * Supprimer un article du panier
   */
  async removeItem(sessionId: string, productId: number): Promise<Cart> {
    // Récupérer ou créer le panier si nécessaire
    const cart = await this.getOrCreateCart(sessionId);

    const updatedCart = cart.removeItem(productId);
    await this.cartRepository.updateCart(updatedCart);

    return updatedCart;
  }

  /**
   * Vider le panier
   */
  async clearCart(sessionId: string): Promise<Cart> {
    // Récupérer ou créer le panier si nécessaire
    const cart = await this.getOrCreateCart(sessionId);

    const clearedCart = cart.clear();
    await this.cartRepository.updateCart(clearedCart);

    return clearedCart;
  }

  /**
   * Mettre à jour les données checkout
   */
  async updateCheckoutData(
    sessionId: string,
    checkoutData: CartCheckoutData
  ): Promise<Cart> {
    let cart = await this.getCart(sessionId);

    if (!cart) {
      cart = await this.createCart(sessionId);
    }

    // Le cart-service stocke simplement les données checkout telles qu'elles sont
    // Le backend (customer-service) garantira le pays lors de la création des adresses
    const updatedCart = cart.updateCheckoutData(checkoutData);
    await this.cartRepository.updateCart(updatedCart);

    return updatedCart;
  }

  /**
   * Récupérer les données checkout
   * Retourne les données telles qu'elles sont stockées
   * Le backend (customer-service) garantira le pays lors de la création des adresses
   */
  async getCheckoutData(sessionId: string): Promise<CartCheckoutData | null> {
    const cart = await this.getCart(sessionId);
    return cart?.checkoutData || null;
  }

  /**
   * Supprimer les données checkout
   */
  async clearCheckoutData(sessionId: string): Promise<Cart> {
    const cart = await this.getCart(sessionId);
    if (!cart) {
      throw new Error("Panier non trouvé");
    }

    const updatedCart = cart.clearCheckoutData();
    await this.cartRepository.updateCart(updatedCart);

    return updatedCart;
  }
}
