/**
 * Hook pour gérer un item du panier
 */

import { useState, useCallback, useEffect } from "react";
import { useCart, CartItemPublicDTO } from "../../contexts/CartContext";
import { logger } from "../../services/logger";

interface UseCartItemResult {
  quantity: number;
  isLoading: boolean;
  handleIncrement: () => Promise<void>;
  handleDecrement: () => Promise<void>;
  handleRemove: () => Promise<void>;
  stockError: string | null; // Message d'erreur uniquement quand l'API retourne une erreur de stock
}

/**
 * Hook pour gérer l'état et les actions d'un item du panier
 */
export function useCartItem(item: CartItemPublicDTO): UseCartItemResult {
  const { updateQuantity, removeFromCart, isLoading } = useCart();
  const [stockError, setStockError] = useState<string | null>(null);

  // Réinitialiser l'erreur de stock quand la quantité change (mise à jour réussie)
  useEffect(() => {
    setStockError(null);
  }, [item.quantity]);

  /**
   * Gère l'augmentation de la quantité
   * Comme dans useProductPage et useProductCard, on incrémente directement
   * Le backend validera le stock disponible et retournera une erreur si nécessaire
   */
  const handleIncrement = useCallback(async () => {
    // Réinitialiser l'erreur de stock avant la nouvelle tentative
    setStockError(null);

    try {
      // Incrémenter directement, comme dans useProductPage et useProductCard
      // Le backend gérera la validation du stock disponible
      await updateQuantity(item.productId, item.quantity + 1);
    } catch (error: any) {
      // Vérifier si c'est une erreur de stock insuffisant
      // Vérifier dans error.message, error.data.message, et error.data.error
      const errorMessage =
        error?.message ||
        error?.data?.message ||
        error?.data?.error ||
        String(error);

      const isStockError =
        errorMessage.toLowerCase().includes("stock insuffisant") ||
        errorMessage.toLowerCase().includes("stock unavailable") ||
        errorMessage.toLowerCase().includes("insufficient stock");

      // Ne pas logger les erreurs de stock (c'est normal)
      if (!isStockError) {
        logger.error("Erreur lors de la mise à jour de la quantité", error, {
          productId: item.productId,
          quantity: item.quantity + 1,
        });
      }

      if (isStockError) {
        // Afficher simplement "Stock limité" sans le nombre
        setStockError("Stock limité");
      }
    }
  }, [item.productId, item.quantity, updateQuantity]);

  /**
   * Gère la diminution de la quantité
   * Si quantité = 1, on supprime l'article
   * Le stock disponible sera automatiquement rafraîchi via le useEffect qui écoute item.quantity
   */
  const handleDecrement = useCallback(async () => {
    // Réinitialiser l'erreur de stock avant la nouvelle tentative
    setStockError(null);

    if (item.quantity <= 1) {
      // Si quantité = 1, on supprime l'article
      try {
        await removeFromCart(item.productId);
      } catch (error) {
        logger.error("Erreur lors de la suppression de l'article", error, {
          productId: item.productId,
        });
      }
    } else {
      try {
        await updateQuantity(item.productId, item.quantity - 1);
      } catch (error: any) {
        // Vérifier si c'est une erreur de stock (ne pas logger)
        const errorMessage =
          error?.message ||
          error?.data?.message ||
          error?.data?.error ||
          String(error);

        const isStockError =
          errorMessage.toLowerCase().includes("stock insuffisant") ||
          errorMessage.toLowerCase().includes("stock unavailable") ||
          errorMessage.toLowerCase().includes("insufficient stock");

        // Ne pas logger les erreurs de stock (c'est normal)
        if (!isStockError) {
          logger.error("Erreur lors de la mise à jour de la quantité", error, {
            productId: item.productId,
            quantity: item.quantity - 1,
          });
        }
      }
    }
  }, [item.productId, item.quantity, updateQuantity, removeFromCart]);

  const handleRemove = useCallback(async () => {
    try {
      await removeFromCart(item.productId);
    } catch (err) {
      logger.error("Error removing item", err, { productId: item.productId });
    }
  }, [item.productId, removeFromCart]);

  return {
    quantity: item.quantity,
    isLoading,
    handleIncrement,
    handleDecrement,
    handleRemove,
    stockError,
  };
}
