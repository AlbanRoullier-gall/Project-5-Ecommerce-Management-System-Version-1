/**
 * Hook pour gérer la logique d'une carte produit
 * Encapsule toute la logique métier liée au panier pour un produit
 */

import { useState, useCallback } from "react";
import { ProductPublicDTO } from "../../dto";
import { useCart } from "../../contexts/CartContext";
import { imageService } from "../../services/imageService";
import { logger } from "../../services/logger";

interface UseProductCardResult {
  quantityInCart: number;
  isLoading: boolean;
  isHovered: boolean;
  setIsHovered: (hovered: boolean) => void;
  handleAddToCart: () => Promise<void>;
  handleIncrement: () => Promise<void>;
  handleDecrement: () => Promise<void>;
  getImageUrl: () => string;
  canAddToCart: boolean;
  canIncrement: boolean;
  isOutOfStock: boolean;
  isLowStock: boolean;
}

/**
 * Hook pour gérer la logique d'une carte produit
 */
export function useProductCard(
  product: ProductPublicDTO
): UseProductCardResult {
  const [isHovered, setIsHovered] = useState(false);
  const { cart, addToCart, updateQuantity, removeFromCart, isLoading } =
    useCart();

  /**
   * Récupère l'URL de la première image du produit
   */
  const getImageUrl = useCallback(() => {
    if (product.images && product.images.length > 0) {
      const firstImage = product.images[0];
      return imageService.getImageUrl(firstImage.filePath);
    }
    return "/images/placeholder.svg";
  }, [product.images]);

  /**
   * Trouve l'article dans le panier s'il existe
   */
  const cartItem = cart?.items?.find((item) => item.productId === product.id);
  const quantityInCart = cartItem?.quantity || 0;

  /**
   * Vérifie la disponibilité du stock
   */
  const availableStock = product.stock ?? 0;
  const isOutOfStock = !product.isActive || availableStock === 0;
  const isLowStock = availableStock > 0 && availableStock < 10;
  const canAddToCart = !isOutOfStock && availableStock > 0;
  const canIncrement = !isOutOfStock && quantityInCart < availableStock;

  /**
   * Gère l'ajout au panier
   */
  const handleAddToCart = useCallback(async () => {
    if (!canAddToCart) return;

    try {
      const imageUrl =
        product.images && product.images.length > 0
          ? imageService.getImageUrl(product.images[0].filePath)
          : undefined;
      await addToCart(
        product.id,
        1,
        product.priceTTC,
        product.vatRate,
        product.name,
        product.description || undefined,
        imageUrl
      );
    } catch (error) {
      logger.error("Erreur lors de l'ajout au panier", error, {
        productId: product.id,
      });
    }
  }, [product, addToCart, canAddToCart]);

  /**
   * Gère l'augmentation de la quantité
   */
  const handleIncrement = useCallback(async () => {
    if (!canIncrement) return;

    const newQuantity = Math.min(quantityInCart + 1, availableStock);
    try {
      await updateQuantity(product.id, newQuantity);
    } catch (error) {
      logger.error("Erreur lors de la mise à jour de la quantité", error, {
        productId: product.id,
        quantity: newQuantity,
      });
    }
  }, [
    product.id,
    quantityInCart,
    updateQuantity,
    canIncrement,
    availableStock,
  ]);

  /**
   * Gère la diminution de la quantité
   */
  const handleDecrement = useCallback(async () => {
    if (quantityInCart <= 1) {
      // Si quantité = 1, on supprime l'article
      try {
        await removeFromCart(product.id);
      } catch (error) {
        logger.error("Erreur lors de la suppression de l'article", error, {
          productId: product.id,
        });
      }
    } else {
      try {
        await updateQuantity(product.id, quantityInCart - 1);
      } catch (error) {
        logger.error("Erreur lors de la mise à jour de la quantité", error, {
          productId: product.id,
          quantity: quantityInCart - 1,
        });
      }
    }
  }, [product.id, quantityInCart, updateQuantity, removeFromCart]);

  return {
    quantityInCart,
    isLoading,
    isHovered,
    setIsHovered,
    handleAddToCart,
    handleIncrement,
    handleDecrement,
    getImageUrl,
    canAddToCart,
    canIncrement,
    isOutOfStock,
    isLowStock,
  };
}
