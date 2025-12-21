/**
 * Hook pour gérer la logique d'une carte produit
 * Encapsule toute la logique métier liée au panier pour un produit
 */

import { useState, useCallback, useEffect } from "react";
import { ProductPublicDTO } from "../../dto";
import { useCart } from "../../contexts/CartContext";
import { imageService } from "../../services/imageService";
import { logger } from "../../services/logger";
import * as productService from "../../services/productService";

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
  const [availableStock, setAvailableStock] = useState<number | null>(null);
  const [isLoadingStock, setIsLoadingStock] = useState(true);
  const { cart, addToCart, updateQuantity, removeFromCart, isLoading } =
    useCart();

  /**
   * Récupère le stock disponible réel (stock - réservations actives)
   */
  useEffect(() => {
    const fetchAvailableStock = async () => {
      try {
        setIsLoadingStock(true);
        // Passer le stock brut comme fallback en cas d'erreur
        const stock = await productService.getAvailableStock(
          product.id,
          product.stock ?? 0
        );
        setAvailableStock(stock);
      } catch (error) {
        logger.error(
          "Erreur lors de la récupération du stock disponible",
          error,
          {
            productId: product.id,
          }
        );
        // En cas d'erreur, utiliser le stock brut comme fallback
        setAvailableStock(product.stock ?? 0);
      } finally {
        setIsLoadingStock(false);
      }
    };

    fetchAvailableStock();
  }, [product.id, product.stock]);

  /**
   * Récupère l'URL de la première image du produit
   */
  const getImageUrl = useCallback(() => {
    if (product.images && product.images.length > 0) {
      const firstImage = product.images[0];
      return imageService.getImageUrlFromImage(firstImage);
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
   * Utilise le stock disponible réel si disponible, sinon le stock brut
   */
  const stock = availableStock !== null ? availableStock : product.stock ?? 0;
  const isOutOfStock = !product.isActive || stock === 0;
  const isLowStock = stock > 0 && stock < 10;
  const canAddToCart = !isOutOfStock && stock > 0;
  const canIncrement = !isOutOfStock && quantityInCart < stock;

  /**
   * Gère l'ajout au panier
   */
  const handleAddToCart = useCallback(async () => {
    if (!canAddToCart) return;

    try {
      const imageUrl =
        product.images && product.images.length > 0
          ? imageService.getImageUrlFromImage(product.images[0])
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
      // Rafraîchir le stock disponible après l'ajout
      const updatedStock = await productService.getAvailableStock(
        product.id,
        product.stock ?? 0
      );
      setAvailableStock(updatedStock);
    } catch (error) {
      logger.error("Erreur lors de l'ajout au panier", error, {
        productId: product.id,
      });
      // Rafraîchir le stock en cas d'erreur (peut-être que le stock a changé)
      try {
        const updatedStock = await productService.getAvailableStock(
          product.id,
          product.stock ?? 0
        );
        setAvailableStock(updatedStock);
      } catch (refreshError) {
        // Ignorer les erreurs de rafraîchissement
      }
    }
  }, [product, addToCart, canAddToCart]);

  /**
   * Gère l'augmentation de la quantité
   */
  const handleIncrement = useCallback(async () => {
    if (!canIncrement) return;

    const stock = availableStock !== null ? availableStock : product.stock ?? 0;
    const newQuantity = Math.min(quantityInCart + 1, stock);
    try {
      await updateQuantity(product.id, newQuantity);
      // Rafraîchir le stock disponible après la mise à jour
      const updatedStock = await productService.getAvailableStock(product.id);
      setAvailableStock(updatedStock);
    } catch (error) {
      logger.error("Erreur lors de la mise à jour de la quantité", error, {
        productId: product.id,
        quantity: newQuantity,
      });
    }
  }, [
    product.id,
    product.stock,
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
