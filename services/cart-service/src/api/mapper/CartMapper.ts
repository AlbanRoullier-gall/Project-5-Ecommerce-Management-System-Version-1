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
    // Calculer les prix HT/TTC
    const unitPriceTTC = dto.unitPriceTTC;
    const multiplier = 1 + (dto.vatRate || 0) / 100;
    const unitPriceHT =
      multiplier > 0 ? dto.unitPriceTTC / multiplier : dto.unitPriceTTC;
    const totalPriceHT = unitPriceHT * dto.quantity;
    const totalPriceTTC = unitPriceTTC * dto.quantity;

    const itemData: any = {
      id,
      product_id: dto.productId,
      quantity: dto.quantity,
      vat_rate: dto.vatRate,
      unit_price_ht: unitPriceHT,
      unit_price_ttc: unitPriceTTC,
      total_price_ht: totalPriceHT,
      total_price_ttc: totalPriceTTC,
      added_at: new Date(),
    };
    if (dto.productName !== undefined) {
      itemData.product_name = dto.productName;
    }
    if (dto.description !== undefined) {
      itemData.description = dto.description;
    }
    if (dto.imageUrl !== undefined) {
      itemData.image_url = dto.imageUrl;
    }
    console.log("🔧 CartMapper - itemData créé:", itemData);
    const cartItem = new CartItem(itemData);
    console.log("🔧 CartMapper - CartItem créé:", {
      id: cartItem.id,
      productId: cartItem.productId,
      imageUrl: cartItem.imageUrl,
    });
    return cartItem;
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
   * Utilise les valeurs stockées directement (plus besoin de calculer)
   */
  static cartItemToPublicDTO(item: CartItem): DTO.CartItemPublicDTO {
    const dto: DTO.CartItemPublicDTO = {
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      vatRate: item.vatRate,
      unitPriceHT: item.unitPriceHT,
      unitPriceTTC: item.unitPriceTTC,
      totalPriceHT: item.totalPriceHT,
      totalPriceTTC: item.totalPriceTTC,
      addedAt: item.addedAt,
    };
    if (item.productName !== undefined) {
      dto.productName = item.productName;
    }
    if (item.description !== undefined) {
      dto.description = item.description;
    }
    if (item.imageUrl !== undefined) {
      dto.imageUrl = item.imageUrl;
    }
    console.log("🔧 CartMapper - DTO créé:", {
      id: dto.id,
      productId: dto.productId,
      imageUrl: dto.imageUrl,
      itemImageUrl: item.imageUrl,
    });
    return dto;
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
