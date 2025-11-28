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
   * Garantit que productName, description et imageUrl sont correctement capturés
   */
  static cartItemCreateDTOToCartItem(
    dto: DTO.CartItemCreateDTO,
    id: string
  ): CartItem {
    // Validation que productName est présent
    if (!dto.productName || dto.productName.trim().length === 0) {
      throw new Error("Product name is required and cannot be empty");
    }

    // Calculer les prix HT/TTC
    const unitPriceTTC = dto.unitPriceTTC;
    const multiplier = 1 + (dto.vatRate || 0) / 100;
    const unitPriceHT =
      multiplier > 0 ? dto.unitPriceTTC / multiplier : dto.unitPriceTTC;
    const totalPriceHT = unitPriceHT * dto.quantity;
    const totalPriceTTC = unitPriceTTC * dto.quantity;

    const itemData: CartItemData = {
      id,
      product_id: dto.productId,
      product_name: dto.productName.trim(), // Nettoyer et garantir non vide
      quantity: dto.quantity,
      vat_rate: dto.vatRate,
      unit_price_ht: unitPriceHT,
      unit_price_ttc: unitPriceTTC,
      total_price_ht: totalPriceHT,
      total_price_ttc: totalPriceTTC,
      added_at: new Date(),
      description: dto.description ?? null,
      image_url: dto.imageUrl ?? null,
    };

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
      vatBreakdown: cart.vatBreakdown,
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
      expiresAt: cart.expiresAt,
    };
  }

  /**
   * Convertir le modèle CartItem en CartItemPublicDTO
   * Harmonisé avec OrderItemPublicDTO - utilise createdAt au lieu de addedAt
   */
  static cartItemToPublicDTO(item: CartItem): DTO.CartItemPublicDTO {
    return {
      id: item.id,
      productId: item.productId,
      productName: item.productName || "", // Garantir une valeur non vide
      description: item.description ?? null,
      imageUrl: item.imageUrl ?? null,
      quantity: item.quantity,
      vatRate: item.vatRate,
      unitPriceHT: item.unitPriceHT,
      unitPriceTTC: item.unitPriceTTC,
      totalPriceHT: item.totalPriceHT,
      totalPriceTTC: item.totalPriceTTC,
      createdAt: item.addedAt, // Mapper addedAt vers createdAt pour harmonisation
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
