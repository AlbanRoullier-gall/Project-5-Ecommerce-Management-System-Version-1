/**
 * Mapper pour les transformations de données de checkout
 * Transforme les DTOs entre services (mapping simple, pas de logique métier)
 */

import { CartItemPublicDTO } from "../../../shared-types/cart-service";
import { PaymentItem } from "../../../shared-types/payment-service";

/**
 * Transforme les items du panier en items de paiement
 * Mapping simple de structure (pas de logique métier)
 */
export class CheckoutMapper {
  /**
   * Transforme CartItemPublicDTO[] en PaymentItem[]
   * @param cartItems Items du panier
   * @returns Items de paiement formatés pour Stripe
   */
  static cartItemsToPaymentItems(
    cartItems: CartItemPublicDTO[]
  ): PaymentItem[] {
    return cartItems.map((item) => ({
      name: item.productName,
      description: item.description || "",
      price: Math.round(item.unitPriceTTC * 100), // Conversion en centimes
      quantity: item.quantity,
      currency: "eur",
    }));
  }
}
