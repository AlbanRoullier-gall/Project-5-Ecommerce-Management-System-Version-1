/**
 * Hook pour gérer la logique d'une carte produit
 * Encapsule toute la logique métier liée au panier pour un produit
 */

import { useState, useCallback, useEffect, useMemo } from "react";
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
  stockError: string | null; // Message d'erreur uniquement quand l'API retourne une erreur de stock
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
  const [stockError, setStockError] = useState<string | null>(null);
  const { cart, addToCart, updateQuantity, removeFromCart, isLoading } =
    useCart();

  /**
   * Récupère le stock disponible réel (stock - réservations actives)
   * Appelé au chargement initial et quand le produit change
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
   * Utilise useMemo pour mémoriser la valeur et s'assurer qu'elle change quand le panier change
   * Utilise cart directement comme dépendance pour garantir la détection des changements
   */
  const quantityInCart = useMemo(() => {
    const cartItem = cart?.items?.find((item) => item.productId === product.id);
    return cartItem?.quantity || 0;
  }, [cart, product.id]);

  /**
   * Rafraîchit automatiquement le stock disponible quand la quantité dans le panier change
   * Cela garantit que le stock affiché est toujours à jour après chaque action (ajout, incrément, décrément, suppression)
   * Utilise un debounce pour éviter les appels API multiples lors de changements rapides
   *
   * Dépendances :
   * - quantityInCart : la quantité dans le panier (mémorisée avec useMemo)
   * - cart : le panier complet (pour détecter les changements même si quantityInCart ne change pas)
   * - product.id, product.stock : pour réagir aux changements de produit
   * - isLoadingStock : pour éviter les rafraîchissements pendant le chargement initial
   */
  useEffect(() => {
    // Ne pas rafraîchir si le stock est en cours de chargement initial
    if (isLoadingStock) return;

    // Debounce réduit à 200ms pour une meilleure réactivité dans le catalogue
    // Cela évite les appels API multiples si plusieurs actions se produisent rapidement
    const timeoutId = setTimeout(async () => {
      try {
        // Rafraîchir le stock disponible après le changement de quantité dans le panier
        // Cela prend en compte les réservations libérées (décrément) ou créées (incrément)
        const updatedStock = await productService.getAvailableStock(
          product.id,
          product.stock ?? 0
        );
        setAvailableStock(updatedStock);
      } catch (error) {
        logger.error(
          "Erreur lors du rafraîchissement du stock disponible",
          error,
          {
            productId: product.id,
            quantityInCart,
          }
        );
        // En cas d'erreur, ne pas mettre à jour (garder la valeur précédente)
      }
    }, 200); // Debounce de 200ms (réduit pour une meilleure réactivité)

    // Nettoyer le timeout si quantityInCart ou cart change à nouveau avant la fin du délai
    return () => clearTimeout(timeoutId);
  }, [quantityInCart, cart, product.id, product.stock, isLoadingStock]);

  /**
   * Vérifie la disponibilité du stock
   * On ne bloque plus l'ajout/incrémentation côté frontend
   * Le backend gérera la validation et retournera une erreur si nécessaire
   */
  const realStock = product.stock ?? 0;
  const availableStockValue =
    availableStock !== null ? availableStock : realStock;

  // Peut ajouter au panier si produit actif (le backend validera le stock)
  const canAddToCart = product.isActive && realStock > 0;

  // Peut incrémenter si produit actif (le backend validera le stock)
  const canIncrement = product.isActive && realStock > 0;

  /**
   * Gère l'ajout au panier
   */
  const handleAddToCart = useCallback(async () => {
    if (!canAddToCart) return;

    // Réinitialiser l'erreur de stock avant la nouvelle tentative
    setStockError(null);

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
      // Le useEffect qui écoute quantityInCart rafraîchira automatiquement le stock
    } catch (error: any) {
      logger.error("Erreur lors de l'ajout au panier", error, {
        productId: product.id,
      });

      // Vérifier si c'est une erreur de stock insuffisant
      // Vérifier dans error.message, error.data.message, et error.data.error
      const errorMessage =
        error?.message ||
        error?.data?.message ||
        error?.data?.error ||
        String(error);

      // Toujours rafraîchir le stock en cas d'erreur pour avoir l'état à jour
      try {
        const updatedStock = await productService.getAvailableStock(
          product.id,
          product.stock ?? 0
        );
        setAvailableStock(updatedStock);

        // Si c'est une erreur de stock insuffisant, afficher le message avec le stock disponible
        if (isStockError) {
          // Essayer d'extraire le stock disponible depuis le message d'erreur
          // Format attendu: "Stock insuffisant. Stock disponible: X, quantité demandée: Y"
          // ou "Stock insuffisant. Disponible: X, Demandé: Y"
          // ou "Stock insuffisant pour augmenter la quantité. Disponible: X, Demandé: Y"
          const stockMatch = errorMessage.match(
            /(?:Stock disponible|Disponible)[:\s]+(\d+)/i
          );
          const availableStockFromError = stockMatch
            ? parseInt(stockMatch[1], 10)
            : null;

          if (
            availableStockFromError !== null &&
            availableStockFromError >= 0
          ) {
            setStockError("Stock limité");
          } else if (updatedStock >= 0) {
            // Utiliser le stock récupéré depuis l'API
            setStockError("Stock limité");
          } else {
            setStockError("Stock insuffisant pour cette quantité");
          }
        }
      } catch (refreshError) {
        // Si le rafraîchissement échoue, vérifier quand même si c'est une erreur de stock
        if (
          errorMessage.toLowerCase().includes("stock insuffisant") ||
          errorMessage.toLowerCase().includes("stock unavailable") ||
          errorMessage.toLowerCase().includes("insufficient stock")
        ) {
          // Essayer d'extraire le stock depuis le message d'erreur
          const stockMatch = errorMessage.match(
            /(?:Stock disponible|Disponible)[:\s]+(\d+)/i
          );
          const availableStockFromError = stockMatch
            ? parseInt(stockMatch[1], 10)
            : null;

          if (
            availableStockFromError !== null &&
            availableStockFromError >= 0
          ) {
            setStockError("Stock limité");
          } else {
            setStockError("Stock insuffisant pour cette quantité");
          }
        }
      }
    }
  }, [product, addToCart, canAddToCart]);

  /**
   * Gère l'augmentation de la quantité
   * Comme dans useProductPage, on incrémente directement sans vérifier canIncrement
   * Le backend validera le stock disponible et retournera une erreur si nécessaire
   */
  const handleIncrement = useCallback(async () => {
    if (!product) return;

    // Réinitialiser l'erreur de stock avant la nouvelle tentative
    setStockError(null);

    try {
      // Incrémenter directement, comme dans useProductPage
      // Le backend gérera la validation du stock disponible
      await updateQuantity(product.id, quantityInCart + 1);
      // Le useEffect qui écoute quantityInCart rafraîchira automatiquement le stock
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
          productId: product.id,
          quantity: quantityInCart + 1,
        });
      }

      // Toujours rafraîchir le stock en cas d'erreur pour avoir l'état à jour
      try {
        const updatedStock = await productService.getAvailableStock(
          product.id,
          product.stock ?? 0
        );
        setAvailableStock(updatedStock);

        // Si c'est une erreur de stock insuffisant, afficher le message avec le stock disponible
        if (isStockError) {
          // Essayer d'extraire le stock disponible depuis le message d'erreur
          // Format attendu: "Stock insuffisant. Stock disponible: X, quantité demandée: Y"
          // ou "Stock insuffisant. Disponible: X, Demandé: Y"
          // ou "Stock insuffisant pour augmenter la quantité. Disponible: X, Demandé: Y"
          const stockMatch = errorMessage.match(
            /(?:Stock disponible|Disponible)[:\s]+(\d+)/i
          );
          const availableStockFromError = stockMatch
            ? parseInt(stockMatch[1], 10)
            : null;

          if (
            availableStockFromError !== null &&
            availableStockFromError >= 0
          ) {
            setStockError("Stock limité");
          } else if (updatedStock >= 0) {
            // Utiliser le stock récupéré depuis l'API
            setStockError("Stock limité");
          } else {
            setStockError("Stock insuffisant pour cette quantité");
          }
        }
      } catch (refreshError) {
        // Si le rafraîchissement échoue, vérifier quand même si c'est une erreur de stock
        if (
          errorMessage.toLowerCase().includes("stock insuffisant") ||
          errorMessage.toLowerCase().includes("stock unavailable") ||
          errorMessage.toLowerCase().includes("insufficient stock")
        ) {
          // Essayer d'extraire le stock depuis le message d'erreur
          const stockMatch = errorMessage.match(
            /(?:Stock disponible|Disponible)[:\s]+(\d+)/i
          );
          const availableStockFromError = stockMatch
            ? parseInt(stockMatch[1], 10)
            : null;

          if (
            availableStockFromError !== null &&
            availableStockFromError >= 0
          ) {
            setStockError("Stock limité");
          } else {
            setStockError("Stock insuffisant pour cette quantité");
          }
        }
      }
    }
  }, [product, quantityInCart, updateQuantity]);

  /**
   * Gère la diminution de la quantité
   * Le stock disponible sera automatiquement rafraîchi via le useEffect qui écoute quantityInCart
   */
  const handleDecrement = useCallback(async () => {
    // Réinitialiser l'erreur de stock avant la nouvelle tentative
    setStockError(null);

    if (quantityInCart <= 1) {
      // Si quantité = 1, on supprime l'article
      try {
        await removeFromCart(product.id);
        // Le useEffect qui écoute quantityInCart rafraîchira automatiquement le stock
      } catch (error) {
        logger.error("Erreur lors de la suppression de l'article", error, {
          productId: product.id,
        });
      }
    } else {
      try {
        await updateQuantity(product.id, quantityInCart - 1);
        // Le useEffect qui écoute quantityInCart rafraîchira automatiquement le stock
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
            productId: product.id,
            quantity: quantityInCart - 1,
          });
        }
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
    stockError,
  };
}
