/**
 * Cart Mapper - Version simplifiée
 * Mapper pour les conversions DTO ↔ Service
 */

import * as DTO from "@tfe/shared-types/cart-service";
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
   * Convert CartCreateDTO to service data
   */
  static cartCreateDTOToServiceData(dto: DTO.CartCreateDTO): any {
    return {
      sessionId: dto.sessionId,
    };
  }

  /**
   * Convert Cart model to CartPublicDTO
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
   * Convert CartItem model to CartItemPublicDTO
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
   * Convert CartItemCreateDTO to service data
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
   * Convert CartItemUpdateDTO to service data
   */
  static cartItemUpdateDTOToServiceData(dto: DTO.CartItemUpdateDTO): any {
    return {
      quantity: dto.quantity,
    };
  }
}
