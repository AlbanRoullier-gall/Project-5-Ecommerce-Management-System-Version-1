/**
 * Mapper de Panier - Version simplifiée
 * Mapper pour les conversions DTO ↔ Service
 */

import * as DTO from "../../../shared-types/cart-service";
import { Cart } from "../../models/Cart";
import { CartItem, CartItemData } from "../../models/CartItem";
function validateAndSanitizeItemData(data: {
  productId: number;
  productName?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  quantity: number;
  vatRate: number;
  unitPriceTTC: number;
}): {
  productId: number;
  productName: string;
  description: string | null;
  imageUrl: string | null;
  quantity: number;
  vatRate: number;
  unitPriceTTC: number;
} {
  if (
    !data.productName ||
    typeof data.productName !== "string" ||
    data.productName.trim().length === 0
  ) {
    throw new Error("Product name is required and cannot be empty");
  }
  return {
    productId: data.productId,
    productName: data.productName.trim(),
    description: data.description ?? null,
    imageUrl: data.imageUrl ?? null,
    quantity: data.quantity,
    vatRate: data.vatRate,
    unitPriceTTC: data.unitPriceTTC,
  };
}

/**
 * Arrondir un nombre à 2 décimales
 */
function roundTo2Decimals(value: number | null | undefined): number {
  if (value === null || value === undefined || isNaN(value)) {
    return 0;
  }
  return parseFloat(Number(value).toFixed(2));
}

function calculateItemTotals(
  unitPriceHT: number,
  unitPriceTTC: number,
  quantity: number
): {
  totalPriceHT: number;
  totalPriceTTC: number;
  totalVAT: number;
} {
  const totalPriceHT = unitPriceHT * quantity;
  const totalPriceTTC = unitPriceTTC * quantity;
  const totalVAT = totalPriceTTC - totalPriceHT;

  return {
    totalPriceHT: roundTo2Decimals(totalPriceHT),
    totalPriceTTC: roundTo2Decimals(totalPriceTTC),
    totalVAT: roundTo2Decimals(totalVAT),
  };
}

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
    // Validation et nettoyage
    const sanitized = validateAndSanitizeItemData({
      productId: dto.productId,
      productName: dto.productName,
      description: dto.description ?? null,
      imageUrl: dto.imageUrl ?? null,
      quantity: dto.quantity,
      vatRate: dto.vatRate,
      unitPriceTTC: dto.unitPriceTTC,
    });

    // Calculer les prix HT/TTC
    const multiplier = 1 + (sanitized.vatRate || 0) / 100;
    const unitPriceHT =
      multiplier > 0
        ? sanitized.unitPriceTTC / multiplier
        : sanitized.unitPriceTTC;
    const { totalPriceHT, totalPriceTTC } = calculateItemTotals(
      unitPriceHT,
      sanitized.unitPriceTTC,
      sanitized.quantity
    );

    const itemData: CartItemData = {
      id,
      product_id: sanitized.productId,
      product_name: sanitized.productName,
      quantity: sanitized.quantity,
      vat_rate: sanitized.vatRate,
      unit_price_ht: unitPriceHT,
      unit_price_ttc: sanitized.unitPriceTTC,
      total_price_ht: totalPriceHT,
      total_price_ttc: totalPriceTTC,
      added_at: new Date(),
      description: sanitized.description,
      image_url: sanitized.imageUrl,
    };

    return new CartItem(itemData);
  }

  /**
   * Arrondir un nombre à 2 décimales
   */
  private static roundTo2Decimals(value: number | null | undefined): number {
    if (value === null || value === undefined || isNaN(value)) {
      return 0;
    }
    return parseFloat(Number(value).toFixed(2));
  }

  /**
   * Convertir le modèle Cart en CartPublicDTO
   */
  static cartToPublicDTO(cart: Cart): DTO.CartPublicDTO {
    return {
      id: cart.id,
      sessionId: cart.sessionId,
      items: cart.items.map((item) => this.cartItemToPublicDTO(item)),
      subtotal: this.roundTo2Decimals(cart.subtotal),
      tax: this.roundTo2Decimals(cart.tax),
      total: this.roundTo2Decimals(cart.total),
      itemCount: cart.itemCount, // Nombre total d'articles calculé côté serveur
      vatBreakdown: cart.vatBreakdown.map((item) => ({
        rate: item.rate,
        amount: this.roundTo2Decimals(item.amount),
      })),
      checkoutData: cart.checkoutData || null,
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
      expiresAt: cart.expiresAt,
    };
  }

  /**
   * Convertir le modèle CartItem en CartItemPublicDTO
   * Harmonisé avec OrderItemPublicDTO - utilise createdAt au lieu de addedAt
   * Structure simplifiée grâce à BaseItemDTO
   */
  static cartItemToPublicDTO(item: CartItem): DTO.CartItemPublicDTO {
    return {
      id: item.id, // Spécifique à Cart (UUID string)
      productId: item.productId,
      productName: item.productName || "",
      description: item.description ?? null,
      imageUrl: item.imageUrl ?? null,
      quantity: item.quantity,
      vatRate: item.vatRate,
      unitPriceHT: this.roundTo2Decimals(item.unitPriceHT),
      unitPriceTTC: this.roundTo2Decimals(item.unitPriceTTC),
      totalPriceHT: this.roundTo2Decimals(item.totalPriceHT),
      totalPriceTTC: this.roundTo2Decimals(item.totalPriceTTC),
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
