/**
 * Mapper pour les transformations de données de paiement
 * Transforme les DTOs entre services (mapping simple, pas de logique métier)
 */

import { CartItemPublicDTO } from "../../../shared-types/cart-service";
import { OrderCompleteDTO } from "../../../shared-types/order-service";

/**
 * Transforme les items du panier en items de commande
 * Mapping simple de structure (pas de logique métier)
 */
export class PaymentMapper {
  /**
   * Transforme CartItemPublicDTO[] en items de commande
   * @param cartItems Items du panier
   * @returns Items de commande
   */
  static cartItemsToOrderItems(
    cartItems: CartItemPublicDTO[]
  ): OrderCompleteDTO["items"] {
    return cartItems.map((item) => ({
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      unitPriceHT: item.unitPriceHT,
      unitPriceTTC: item.unitPriceTTC,
      vatRate: item.vatRate,
      totalPriceHT: item.totalPriceHT,
      totalPriceTTC: item.totalPriceTTC,
    }));
  }
}
