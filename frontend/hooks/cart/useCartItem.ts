/**
 * Hook pour gérer un item du panier
 */

import { useState, useCallback } from "react";
import { useCart, CartItemPublicDTO } from "../../contexts/CartContext";
import { logger } from "../../services/logger";

interface UseCartItemResult {
  quantity: number;
  isUpdating: boolean;
  handleQuantityChange: (newQuantity: number) => Promise<void>;
  handleRemove: () => Promise<void>;
}

/**
 * Hook pour gérer l'état et les actions d'un item du panier
 */
export function useCartItem(item: CartItemPublicDTO): UseCartItemResult {
  const { updateQuantity, removeFromCart } = useCart();
  const [isUpdating, setIsUpdating] = useState(false);
  const [quantity, setQuantity] = useState(item.quantity);

  const handleQuantityChange = useCallback(
    async (newQuantity: number) => {
      if (newQuantity < 1) return;

      setQuantity(newQuantity);
      setIsUpdating(true);

      try {
        await updateQuantity(item.productId, newQuantity);
      } catch (err) {
        // Restaurer l'ancienne quantité en cas d'erreur
        setQuantity(item.quantity);
      } finally {
        setIsUpdating(false);
      }
    },
    [item.productId, item.quantity, updateQuantity]
  );

  const handleRemove = useCallback(async () => {
    setIsUpdating(true);
    try {
      await removeFromCart(item.productId);
    } catch (err) {
      logger.error("Error removing item", err, { productId: item.productId });
    } finally {
      setIsUpdating(false);
    }
  }, [item.productId, removeFromCart]);

  return {
    quantity,
    isUpdating,
    handleQuantityChange,
    handleRemove,
  };
}
