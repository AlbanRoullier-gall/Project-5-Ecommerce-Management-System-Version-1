/**
 * Mapper de Panier - Version simplifiée
 * Mapper pour les conversions DTO ↔ Service
 */

import * as DTO from "@tfe/shared-types/cart-service";
import { Cart } from "../../models/Cart";
import { CartItem } from "../../models/CartItem";

/**
 * Classe Mapper de Panier
 */
export class CartMapper {
  /**
   * Convertir CartItemCreateDTO en CartItem
   */
  static cartItemCreateDTOToCartItem(
    dto: DTO.CartItemCreateDTO,
    id: string
  ): CartItem {
    return new CartItem({
      id,
      product_id: dto.productId,
      quantity: dto.quantity,
      price: dto.price,
      vat_rate: dto.vatRate,
      added_at: new Date(),
    });
  }

  /**
   * Convertir le modèle Cart en CartPublicDTO
   */
  static cartToPublicDTO(cart: Cart): DTO.CartPublicDTO {
    return {
      id: cart.id,
      sessionId: cart.sessionId,
      items: cart.items.map((item) => this.cartItemToPublicDTO(item)),
      subtotal: cart.subtotal,
      tax: cart.tax,
      total: cart.total,
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
      expiresAt: cart.expiresAt,
    };
  }

  /**
   * Convertir le modèle CartItem en CartItemPublicDTO
   */
  static cartItemToPublicDTO(item: CartItem): DTO.CartItemPublicDTO {
    return {
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      price: item.price,
      vatRate: item.vatRate,
      total: item.getTotal(),
      addedAt: item.addedAt,
    };
  }

  /**
   * Convertir CartItemCreateDTO en données de service
   */
  static cartItemCreateDTOToServiceData(dto: DTO.CartItemCreateDTO): any {
    return {
      productId: dto.productId,
      quantity: dto.quantity,
      price: dto.price,
      vatRate: dto.vatRate,
    };
  }

  /**
   * Convertir CartItemUpdateDTO en données de service
   */
  static cartItemUpdateDTOToServiceData(dto: DTO.CartItemUpdateDTO): any {
    return {
      quantity: dto.quantity,
    };
  }

  /**
   * Convertir CartClearDTO en données de service
   */
  static cartClearDTOToServiceData(dto: DTO.CartClearDTO): any {
    return {
      sessionId: dto.sessionId,
    };
  }
}
