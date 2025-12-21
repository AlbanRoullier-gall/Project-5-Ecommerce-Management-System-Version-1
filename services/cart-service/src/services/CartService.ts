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
    requestedQuantity: number,
    sessionId?: string
  ): Promise<void> {
    const startTime = Date.now();
    console.log(
      `[CartService] checkProductStock: Vérification du stock pour productId=${productId}, quantity=${requestedQuantity}`
    );

    try {
      // Ajouter un timeout pour éviter les blocages
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 10000); // Timeout de 10 secondes

      // Si sessionId est fourni, réserver le stock atomiquement
      // Sinon, juste vérifier le stock (comportement legacy)
      const url = sessionId
        ? `${API_GATEWAY_URL}/api/stock/check/${productId}?quantity=${requestedQuantity}&sessionId=${encodeURIComponent(
            sessionId
          )}`
        : `${API_GATEWAY_URL}/api/stock/check/${productId}?quantity=${requestedQuantity}`;

      const response = await fetch(url, {
        headers: {
          "X-Service-Request": "cart-service",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const duration = Date.now() - startTime;
      console.log(
        `[CartService] checkProductStock: Réponse reçue après ${duration}ms, status=${response.status}`
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData.error || `Erreur lors de la vérification du stock`;
        console.error(
          `[CartService] checkProductStock: Erreur ${response.status}: ${errorMessage}`
        );
        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (!data.success || !data.data) {
        console.error(
          `[CartService] checkProductStock: Réponse invalide:`,
          JSON.stringify(data, null, 2)
        );
        throw new Error(
          data.error || "Erreur lors de la vérification du stock"
        );
      }

      // Vérifier si le stock est disponible
      if (!data.data.isAvailable) {
        console.error(
          `[CartService] checkProductStock: Stock insuffisant pour productId=${productId}`
        );
        throw new Error(data.data.message || "Stock insuffisant");
      }

      if (sessionId && data.data.reservationId) {
        console.log(
          `[CartService] checkProductStock: ✅ Stock réservé pour productId=${productId}, reservationId=${data.data.reservationId}`
        );
      } else {
        console.log(
          `[CartService] checkProductStock: ✅ Stock disponible pour productId=${productId}`
        );
      }
    } catch (error: any) {
      if (error.name === "AbortError") {
        console.error(
          `[CartService] checkProductStock: ⏱️ Timeout de 10s atteint pour productId=${productId}`
        );
        // En cas de timeout, on laisse passer (le payment-handler validera à nouveau)
        console.warn(
          `[CartService] checkProductStock: Timeout - la vérification du stock sera faite lors du paiement`
        );
        return; // Ne pas bloquer l'ajout au panier en cas de timeout
      }

      if (
        error.message.includes("Stock insuffisant") ||
        error.message.includes("plus disponible") ||
        error.message.includes("n'est plus disponible")
      ) {
        throw error;
      }
      // En cas d'erreur de réseau, on laisse passer (le payment-handler validera à nouveau)
      console.warn(
        `[CartService] checkProductStock: Impossible de vérifier le stock pour le produit ${productId}:`,
        error.message
      );
      // Ne pas bloquer l'ajout au panier en cas d'erreur réseau
    }
  }

  /**
   * Mettre à jour la quantité d'une réservation de stock
   * @param sessionId ID de session du panier
   * @param productId ID du produit
   * @param quantity Nouvelle quantité
   */
  private async updateStockReservation(
    sessionId: string,
    productId: number,
    quantity: number
  ): Promise<void> {
    try {
      const response = await fetch(`${API_GATEWAY_URL}/api/stock/reservation`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Service-Request": "cart-service",
        },
        body: JSON.stringify({
          sessionId,
          productId,
          quantity,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData.error || "Erreur lors de la mise à jour de la réservation";
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log(
        `[CartService] updateStockReservation: ✅ Réservation mise à jour pour productId=${productId}, quantity=${quantity}`
      );
    } catch (error: any) {
      console.error(
        `[CartService] updateStockReservation: Erreur:`,
        error.message
      );
      throw error;
    }
  }

  /**
   * Libérer une réservation de stock
   * @param sessionId ID de session du panier
   * @param productId ID du produit (optionnel, si null libère toutes les réservations)
   */
  private async releaseStockReservation(
    sessionId: string,
    productId?: number
  ): Promise<void> {
    try {
      const response = await fetch(`${API_GATEWAY_URL}/api/stock/release`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Service-Request": "cart-service",
        },
        body: JSON.stringify({
          sessionId,
          productId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.warn(
          `[CartService] releaseStockReservation: Erreur ${response.status}: ${
            errorData.error || "Erreur lors de la libération"
          }`
        );
        // Ne pas throw, juste logger l'erreur (non bloquant)
        return;
      }

      const data = await response.json();
      const releasedCount = data.data?.releasedCount || 0;
      if (releasedCount > 0) {
        console.log(
          `[CartService] releaseStockReservation: ✅ ${releasedCount} réservation(s) libérée(s) pour sessionId=${sessionId.substring(
            0,
            20
          )}...`
        );
      }
    } catch (error: any) {
      console.warn(
        `[CartService] releaseStockReservation: Erreur lors de la libération:`,
        error.message
      );
      // Ne pas throw, juste logger l'erreur (non bloquant)
    }
  }

  /**
   * Ajouter un article au panier
   */
  async addItem(
    sessionId: string,
    itemData: DTO.CartItemCreateDTO
  ): Promise<Cart> {
    const startTime = Date.now();
    console.log(
      `[CartService] addItem: Début - sessionId: ${sessionId.substring(
        0,
        20
      )}..., productId: ${itemData.productId}, quantity: ${itemData.quantity}`
    );

    try {
      // Vérifier et réserver le stock avant d'ajouter
      console.log(
        `[CartService] addItem: Étape 1 - Vérification/réservation du stock pour productId=${itemData.productId}`
      );
      await this.checkProductStock(
        itemData.productId,
        itemData.quantity,
        sessionId
      );
      console.log(
        `[CartService] addItem: ✅ Stock vérifié/réservé pour productId=${itemData.productId}`
      );

      // Récupérer ou créer le panier
      console.log(
        `[CartService] addItem: Étape 2 - Récupération/création du panier`
      );
      let cart = await this.getCart(sessionId);

      if (!cart) {
        console.log(
          `[CartService] addItem: Panier non trouvé, création d'un nouveau panier`
        );
        cart = await this.createCart(sessionId);
        console.log(
          `[CartService] addItem: ✅ Nouveau panier créé: ${cart.id}`
        );
      } else {
        console.log(
          `[CartService] addItem: ✅ Panier existant récupéré: ${cart.id}, ${cart.itemCount} articles`
        );
      }

      // Vérifier si l'article existe déjà dans le panier
      const existingItem = cart.items.find(
        (item) => item.productId === itemData.productId
      );
      if (existingItem) {
        console.log(
          `[CartService] addItem: Article existant trouvé, quantité actuelle: ${existingItem.quantity}`
        );
        // Si l'article existe, mettre à jour la réservation pour la quantité totale
        const totalQuantity = existingItem.quantity + itemData.quantity;
        console.log(
          `[CartService] addItem: Mise à jour de la réservation pour quantité totale: ${totalQuantity}`
        );
        // Mettre à jour la réservation existante via l'API
        await this.updateStockReservation(
          sessionId,
          itemData.productId,
          totalQuantity
        );
        console.log(
          `[CartService] addItem: ✅ Réservation mise à jour pour quantité totale`
        );
      }

      console.log(
        `[CartService] addItem: Étape 3 - Création de l'item et ajout au panier`
      );
      const cartItem = CartMapper.cartItemCreateDTOToCartItem(
        itemData,
        uuidv4()
      );

      const updatedCart = cart.addItem(cartItem);
      console.log(
        `[CartService] addItem: ✅ Item ajouté au panier, nouveau itemCount: ${updatedCart.itemCount}`
      );

      console.log(
        `[CartService] addItem: Étape 4 - Sauvegarde du panier dans Redis`
      );
      await this.cartRepository.updateCart(updatedCart);
      console.log(`[CartService] addItem: ✅ Panier sauvegardé dans Redis`);

      const duration = Date.now() - startTime;
      console.log(
        `[CartService] addItem: ✅ Terminé en ${duration}ms - productId=${itemData.productId}, itemCount=${updatedCart.itemCount}`
      );

      return updatedCart;
    } catch (error: any) {
      const duration = Date.now() - startTime;
      console.error(
        `[CartService] addItem: ❌ Erreur après ${duration}ms:`,
        error.message
      );
      throw error;
    }
  }

  /**
   * Mettre à jour la quantité d'un article
   */
  async updateItemQuantity(
    sessionId: string,
    productId: number,
    quantity: number
  ): Promise<Cart> {
    // Récupérer ou créer le panier si nécessaire
    const cart = await this.getOrCreateCart(sessionId);

    // Vérifier si l'article existe dans le panier
    const existingItem = cart.items.find(
      (item) => item.productId === productId
    );

    if (!existingItem) {
      // Si l'article n'existe pas, c'est une erreur - on ne peut pas mettre à jour un article qui n'existe pas
      // Cela ne devrait pas arriver normalement, mais gérons-le gracieusement
      console.warn(
        `Tentative de mise à jour d'un article inexistant (productId: ${productId}) dans le panier ${sessionId}`
      );
      throw new Error(
        `L'article avec l'ID ${productId} n'existe pas dans le panier. Veuillez d'abord l'ajouter au panier.`
      );
    }

    // Mettre à jour la réservation de stock
    if (quantity === 0) {
      // Si quantité = 0, libérer la réservation
      await this.releaseStockReservation(sessionId, productId);
    } else {
      // Sinon, mettre à jour la réservation
      await this.updateStockReservation(sessionId, productId, quantity);
    }

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

    // Libérer la réservation de stock pour cet article
    await this.releaseStockReservation(sessionId, productId);

    const updatedCart = cart.removeItem(productId);
    await this.cartRepository.updateCart(updatedCart);

    return updatedCart;
  }

  /**
   * Vider le panier
   */
  async clearCart(sessionId: string): Promise<Cart> {
    console.log(
      `[CartService] clearCart appelé pour sessionId: ${sessionId.substring(
        0,
        20
      )}...`
    );

    // Récupérer ou créer le panier si nécessaire
    const cart = await this.getOrCreateCart(sessionId);
    console.log(
      `[CartService] Panier récupéré avant vidage: ${cart.itemCount} articles`
    );

    const clearedCart = cart.clear();
    console.log(
      `[CartService] Panier vidé (nouveau itemCount: ${clearedCart.itemCount})`
    );

    // Libérer toutes les réservations de stock pour cette session
    await this.releaseStockReservation(sessionId);

    await this.cartRepository.updateCart(clearedCart);
    console.log(`[CartService] Panier vidé sauvegardé dans Redis`);

    // Vérification: Récupérer le panier après le vidage pour confirmer
    const verifyCart = await this.getCart(sessionId);
    if (verifyCart) {
      console.log(
        `[CartService] Vérification après vidage: panier contient ${verifyCart.itemCount} articles`
      );
      if (verifyCart.itemCount > 0) {
        console.error(
          `[CartService] ⚠️ ERREUR: Le panier contient encore ${verifyCart.itemCount} article(s) après le vidage!`
        );
      }
    } else {
      console.log(
        `[CartService] Vérification après vidage: panier non trouvé (normal si complètement supprimé)`
      );
    }

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
