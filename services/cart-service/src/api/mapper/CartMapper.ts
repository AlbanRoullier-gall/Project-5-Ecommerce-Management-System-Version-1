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
    const itemData: any = {
      id,
      product_id: dto.productId,
      quantity: dto.quantity,
      price: dto.price,
      vat_rate: dto.vatRate,
      added_at: new Date(),
    };
    if (dto.productName !== undefined) {
      itemData.product_name = dto.productName;
    }
    return new CartItem(itemData);
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
   * Inclut maintenant tous les calculs HT/TTC pour éviter les transformations dans l'API Gateway
   */
  static cartItemToPublicDTO(item: CartItem): DTO.CartItemPublicDTO {
    const dto: any = {
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      price: item.price, // Prix unitaire TTC (conservé pour rétrocompatibilité)
      vatRate: item.vatRate,
      total: item.getTotal(), // Total TTC (conservé pour rétrocompatibilité)
      // Nouveaux champs avec calculs HT/TTC complets
      unitPriceHT: item.getUnitPriceHT(),
      unitPriceTTC: item.getUnitPriceTTC(),
      totalPriceHT: item.getTotalHT(),
      totalPriceTTC: item.getTotalTTC(),
      addedAt: item.addedAt,
    };
    if (item.productName !== undefined) {
      dto.productName = item.productName;
    }
    return dto;
  }

  /**
   * Convertir CartItemCreateDTO en données de service
   */
  static cartItemCreateDTOToServiceData(dto: DTO.CartItemCreateDTO): any {
    return {
      productId: dto.productId,
      productName: dto.productName,
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
