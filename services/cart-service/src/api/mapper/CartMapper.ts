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
}
