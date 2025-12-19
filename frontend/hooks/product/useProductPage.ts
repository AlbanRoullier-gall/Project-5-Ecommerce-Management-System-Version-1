/**
 * Hook pour gérer la logique de la page produit
 * Encapsule toute la logique métier liée à l'affichage et à la gestion du panier pour un produit
 */

import { useState, useCallback } from "react";
import { useRouter } from "next/router";
import { ProductPublicDTO } from "../../dto";
import { useCart } from "../../contexts/CartContext";
import { imageService } from "../../services/imageService";
import { logger } from "../../services/logger";

interface UseProductPageResult {
  quantityInCart: number;
  isLoading: boolean;
  selectedImageIndex: number;
  setSelectedImageIndex: (index: number) => void;
  handleAddToCart: () => Promise<void>;
  handleIncrement: () => Promise<void>;
  handleDecrement: () => Promise<void>;
  handleGoHome: () => void;
}

/**
 * Hook pour gérer la logique de la page produit
 */
export function useProductPage(
  product: ProductPublicDTO | null
): UseProductPageResult {
  const router = useRouter();
  const { cart, addToCart, updateQuantity, removeFromCart, isLoading } =
    useCart();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  /**
   * Trouve l'article dans le panier s'il existe
   */
  const quantityInCart =
    (product &&
      cart?.items?.find((item) => item.productId === product.id)?.quantity) ||
    0;

  /**
   * Gère l'ajout au panier
   */
  const handleAddToCart = useCallback(async () => {
    if (!product) return;

    try {
      const priceWithVat = product.priceTTC;
      const imageUrl =
        product.images && product.images.length > 0
          ? imageService.getImageUrlFromImage(product.images[0])
          : undefined;
      await addToCart(
        product.id,
        1,
        priceWithVat,
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
  }, [product, addToCart]);

  /**
   * Gère l'augmentation de la quantité
   */
  const handleIncrement = useCallback(async () => {
    if (!product) return;

    try {
      await updateQuantity(product.id, quantityInCart + 1);
    } catch (error) {
      logger.error("Erreur lors de la mise à jour de la quantité", error, {
        productId: product.id,
        quantity: quantityInCart + 1,
      });
    }
  }, [product, quantityInCart, updateQuantity]);

  /**
   * Gère la diminution de la quantité
   */
  const handleDecrement = useCallback(async () => {
    if (!product) return;

    try {
      if (quantityInCart <= 1) {
        await removeFromCart(product.id);
      } else {
        await updateQuantity(product.id, quantityInCart - 1);
      }
    } catch (error) {
      logger.error("Erreur lors de la mise à jour de la quantité", error, {
        productId: product.id,
        quantity: quantityInCart - 1,
      });
    }
  }, [product, quantityInCart, updateQuantity, removeFromCart]);

  /**
   * Gère le retour à l'accueil
   */
  const handleGoHome = useCallback(() => {
    router.push("/");
  }, [router]);

  return {
    quantityInCart,
    isLoading,
    selectedImageIndex,
    setSelectedImageIndex,
    handleAddToCart,
    handleIncrement,
    handleDecrement,
    handleGoHome,
  };
}
