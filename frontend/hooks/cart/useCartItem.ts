/**
 * Hook pour gérer un item du panier
 */

import { useState, useCallback, useEffect } from "react";
import { useCart, CartItemPublicDTO } from "../../contexts/CartContext";
import { logger } from "../../services/logger";
import * as productService from "../../services/productService";

interface UseCartItemResult {
  quantity: number;
  isUpdating: boolean;
  handleQuantityChange: (newQuantity: number) => Promise<void>;
  handleRemove: () => Promise<void>;
  maxQuantity: number | undefined;
  isLoadingStock: boolean;
}

/**
 * Hook pour gérer l'état et les actions d'un item du panier
 */
export function useCartItem(item: CartItemPublicDTO): UseCartItemResult {
  const { updateQuantity, removeFromCart } = useCart();
  const [isUpdating, setIsUpdating] = useState(false);
  const [quantity, setQuantity] = useState(item.quantity);
  const [maxQuantity, setMaxQuantity] = useState<number | undefined>(undefined);
  const [isLoadingStock, setIsLoadingStock] = useState(true);

  // Synchroniser la quantité avec l'item du panier (après mise à jour)
  useEffect(() => {
    setQuantity(item.quantity);
  }, [item.quantity]);

  // Récupérer le stock disponible réel (stock - réservations actives)
  useEffect(() => {
    const fetchStock = async () => {
      try {
        setIsLoadingStock(true);
        // Note: On n'a pas accès au stock brut ici, donc on utilise undefined comme fallback
        // Le composant gérera l'affichage en fonction du maxQuantity
        const availableStock = await productService.getAvailableStock(
          String(item.productId)
        );
        setMaxQuantity(availableStock);
      } catch (error) {
        logger.error(
          "Erreur lors de la récupération du stock disponible",
          error,
          {
            productId: item.productId,
          }
        );
        // En cas d'erreur, on ne limite pas (maxQuantity reste undefined)
      } finally {
        setIsLoadingStock(false);
      }
    };

    fetchStock();
  }, [item.productId]);

  const handleQuantityChange = useCallback(
    async (newQuantity: number) => {
      if (newQuantity < 1) return;
      if (isUpdating) return; // Éviter les appels multiples simultanés

      // Limiter la quantité au stock disponible
      const finalQuantity =
        maxQuantity !== undefined
          ? Math.min(newQuantity, maxQuantity)
          : newQuantity;

      // Ne pas mettre à jour la quantité locale immédiatement
      // Attendre la confirmation du serveur
      setIsUpdating(true);

      try {
        await updateQuantity(item.productId, finalQuantity);
        // La quantité sera mise à jour via le useEffect qui écoute item.quantity
        // Rafraîchir le stock disponible après la mise à jour
        try {
          const updatedStock = await productService.getAvailableStock(
            String(item.productId)
          );
          setMaxQuantity(updatedStock);
        } catch (refreshError) {
          // Ignorer les erreurs de rafraîchissement
        }
      } catch (err) {
        // En cas d'erreur, la quantité reste celle de item.quantity (via useEffect)
        logger.error("Erreur lors de la mise à jour de la quantité", err);
        // Rafraîchir le stock en cas d'erreur (peut-être que le stock a changé)
        try {
          const updatedStock = await productService.getAvailableStock(
            String(item.productId)
          );
          setMaxQuantity(updatedStock);
        } catch (refreshError) {
          // Ignorer les erreurs de rafraîchissement
        }
      } finally {
        setIsUpdating(false);
      }
    },
    [item.productId, item.quantity, updateQuantity, maxQuantity, isUpdating]
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
    maxQuantity,
    isLoadingStock,
  };
}
