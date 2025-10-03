/**
 * Cart Mapper - Version simplifiée pour Redis
 * Mapper pour les conversions DTO ↔ Service
 */

import {
  CartItemCreateDTO,
  CartItemUpdateDTO,
  CartCreateDTO,
  CartPublicDTO,
  CartItemPublicDTO,
  CartCreateResponse,
  CartRetrieveResponse,
  CartItemAddResponse,
  CartItemUpdateResponse,
  CartItemRemoveResponse,
  CartClearResponse,
  CartValidationResponse,
  CartStatsResponse,
} from "../dto";
import { Cart } from "../../models/Cart";
import { CartItem } from "../../models/CartItem";

/**
 * Cart Mapper class
 */
export class CartMapper {
  /**
   * Convert CartItemCreateDTO to CartItem
   */
  static cartItemCreateDTOToCartItem(
    dto: CartItemCreateDTO,
    id: string
  ): CartItem {
    return new CartItem({
      id,
      product_id: dto.productId,
      quantity: dto.quantity,
      price: dto.price,
      added_at: new Date(),
    });
  }

  /**
   * Convert CartCreateDTO to service data
   */
  static cartCreateDTOToServiceData(dto: CartCreateDTO): any {
    return {
      sessionId: dto.sessionId,
    };
  }

  /**
   * Convert Cart model to CartPublicDTO
   */
  static cartToPublicDTO(cart: Cart): CartPublicDTO {
    return {
      id: cart.id,
      sessionId: cart.sessionId,
      items: cart.items.map((item) => this.cartItemToPublicDTO(item)),
      subtotal: cart.subtotal,
      tax: cart.tax,
      total: cart.total,
      totalItems: cart.getTotalItems(),
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
      expiresAt: cart.expiresAt,
    };
  }

  /**
   * Convert CartItem model to CartItemPublicDTO
   */
  static cartItemToPublicDTO(item: CartItem): CartItemPublicDTO {
    return {
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      price: item.price,
      total: item.getTotal(),
      addedAt: item.addedAt,
    };
  }

  /**
   * Convert CartItemCreateDTO to service data
   */
  static cartItemCreateDTOToServiceData(dto: CartItemCreateDTO): any {
    return {
      productId: dto.productId,
      quantity: dto.quantity,
      price: dto.price,
    };
  }

  /**
   * Convert CartItemUpdateDTO to service data
   */
  static cartItemUpdateDTOToServiceData(dto: CartItemUpdateDTO): any {
    return {
      quantity: dto.quantity,
    };
  }

  // ===== MÉTHODES DE RÉPONSE STRUCTURÉES =====

  /**
   * Créer une réponse de création de panier
   */
  static createCartResponse(cart: Cart): CartCreateResponse {
    return {
      message: "Panier créé avec succès",
      cart: this.cartToPublicDTO(cart),
      timestamp: new Date().toISOString(),
      status: 201,
    };
  }

  /**
   * Créer une réponse de récupération de panier
   */
  static createRetrieveResponse(cart: Cart): CartRetrieveResponse {
    return {
      message: "Panier récupéré avec succès",
      cart: this.cartToPublicDTO(cart),
      timestamp: new Date().toISOString(),
      status: 200,
    };
  }

  /**
   * Créer une réponse d'ajout d'article
   */
  static createItemAddResponse(cart: Cart): CartItemAddResponse {
    return {
      message: "Article ajouté au panier avec succès",
      cart: this.cartToPublicDTO(cart),
      timestamp: new Date().toISOString(),
      status: 200,
    };
  }

  /**
   * Créer une réponse de mise à jour d'article
   */
  static createItemUpdateResponse(cart: Cart): CartItemUpdateResponse {
    return {
      message: "Article mis à jour avec succès",
      cart: this.cartToPublicDTO(cart),
      timestamp: new Date().toISOString(),
      status: 200,
    };
  }

  /**
   * Créer une réponse de suppression d'article
   */
  static createItemRemoveResponse(cart: Cart): CartItemRemoveResponse {
    return {
      message: "Article supprimé du panier avec succès",
      cart: this.cartToPublicDTO(cart),
      timestamp: new Date().toISOString(),
      status: 200,
    };
  }

  /**
   * Créer une réponse de vidage de panier
   */
  static createClearResponse(cart: Cart): CartClearResponse {
    return {
      message: "Panier vidé avec succès",
      cart: this.cartToPublicDTO(cart),
      timestamp: new Date().toISOString(),
      status: 200,
    };
  }

  /**
   * Créer une réponse de validation de panier
   */
  static createValidationResponse(
    validationResult: any,
    cart: Cart
  ): CartValidationResponse {
    return {
      message: validationResult.isValid ? "Panier valide" : "Panier invalide",
      validation: {
        isValid: validationResult.isValid,
        errors: validationResult.errors || [],
        cart: this.cartToPublicDTO(cart),
      },
      timestamp: new Date().toISOString(),
      status: 200,
    };
  }

  /**
   * Créer une réponse de statistiques
   */
  static createStatsResponse(stats: any): CartStatsResponse {
    return {
      message: "Statistiques récupérées avec succès",
      stats,
      timestamp: new Date().toISOString(),
      status: 200,
    };
  }
}
