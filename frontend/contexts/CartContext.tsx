import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from "react";
import {
  CartPublicDTO,
  CartItemPublicDTO,
  CartItemCreateDTO,
  CartItemUpdateDTO,
  CartClearDTO,
} from "../dto";
import {
  getCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  clearCart as clearCartService,
} from "../services/cartService";
import { logger } from "../services/logger";

// Export CartItemPublicDTO pour faciliter l'utilisation dans les composants
export type { CartItemPublicDTO };

interface CartTotals {
  totalHT: number;
  totalTTC: number;
  vatAmount: number;
  breakdown: { rate: number; amount: number }[];
}

interface CartContextType {
  cart: CartPublicDTO | null;
  itemCount: number;
  totals: CartTotals;
  isLoading: boolean;
  error: string | null;
  addToCart: (
    productId: number,
    quantity: number,
    priceTTC: number,
    vatRate: number,
    productName: string, // Requis et non vide
    description?: string,
    imageUrl?: string
  ) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  removeFromCart: (productId: number) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

/**
 * Hook pour utiliser le contexte du panier
 */
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart doit être utilisé dans un CartProvider");
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

/**
 * Provider du contexte panier
 * Gère l'état global du panier et les opérations CRUD
 */
export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cart, setCart] = useState<CartPublicDTO | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  /**
   * Extrait les totaux directement depuis le panier fourni par le cart-service
   * Le cart-service garantit toujours ces valeurs (subtotal, tax, total, vatBreakdown)
   * Mémorisé pour éviter les recalculs inutiles
   */
  const totals: CartTotals = useMemo(
    () =>
      cart
        ? {
            totalHT: cart.subtotal,
            totalTTC: cart.total,
            vatAmount: cart.tax,
            breakdown: cart.vatBreakdown,
          }
        : {
            totalHT: 0,
            totalTTC: 0,
            vatAmount: 0,
            breakdown: [],
          },
    [cart]
  );

  /**
   * Utilise le nombre total d'articles calculé côté serveur
   * Le cart-service calcule déjà itemCount (somme des quantités)
   * Mémorisé pour éviter les recalculs inutiles
   */
  const itemCount = useMemo(() => cart?.itemCount || 0, [cart]);

  /**
   * Fonction utilitaire pour exécuter une opération avec gestion du loading et des erreurs
   * Centralise la logique répétitive de gestion d'état
   */
  const executeWithLoading = useCallback(
    async <T,>(
      operation: () => Promise<T>,
      errorMessage: string
    ): Promise<T> => {
      setIsLoading(true);
      setError(null);

      try {
        return await operation();
      } catch (err) {
        logger.error(errorMessage, err);
        const errorMsg = err instanceof Error ? err.message : errorMessage;
        // Ne pas afficher les erreurs de stock insuffisant dans le panier
        // La limitation est déjà gérée visuellement par le QuantitySelector
        if (!errorMsg.toLowerCase().includes("stock insuffisant")) {
          setError(errorMsg);
        }
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Récupère le panier depuis l'API
   * Le sessionId est géré automatiquement via cookie httpOnly
   */
  const refreshCart = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const cart = await getCart();
      setCart(cart);
      // Si le panier est null, c'est normal (pas de panier existant), ne pas afficher d'erreur
    } catch (err) {
      logger.error("Erreur lors du chargement du panier", err);
      const errorMsg =
        err instanceof Error
          ? err.message
          : "Erreur lors du chargement du panier";
      // Ne pas afficher "Panier non trouvé" comme erreur, c'est un état normal
      if (!errorMsg.includes("Panier non trouvé")) {
        setError(errorMsg);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Charge le panier au montage
   * Le sessionId est géré automatiquement via cookie httpOnly
   */
  useEffect(() => {
    // S'assurer qu'on est bien côté client
    if (typeof window === "undefined") return;

    if (!isInitialized) {
      setIsInitialized(true);
      refreshCart();
    }
  }, [isInitialized, refreshCart]);

  /**
   * Ajoute un article au panier
   * Le sessionId est géré automatiquement via cookie httpOnly
   */
  const addToCart = useCallback(
    async (
      productId: number,
      quantity: number,
      priceTTC: number,
      vatRate: number,
      productName: string, // Requis et non vide
      description?: string,
      imageUrl?: string
    ) => {
      await executeWithLoading(async () => {
        // Créer le DTO pour l'ajout d'article
        const itemData: CartItemCreateDTO = {
          productId,
          productName,
          description,
          imageUrl,
          quantity,
          unitPriceTTC: priceTTC,
          vatRate,
        };

        // Le service gère automatiquement la réponse et le rechargement si nécessaire
        const updatedCart = await addCartItem(itemData);
        setCart(updatedCart);
      }, "Erreur lors de l'ajout au panier");
    },
    [executeWithLoading]
  );

  /**
   * Met à jour la quantité d'un article
   * Le sessionId est géré automatiquement via cookie httpOnly
   */
  const updateQuantity = useCallback(
    async (productId: number, quantity: number) => {
      try {
        setIsLoading(true);
        setError(null);

        // Créer le DTO pour la mise à jour d'article
        const updateData: CartItemUpdateDTO = {
          quantity,
        };

        // Le service recharge automatiquement le panier
        const updatedCart = await updateCartItem(productId, updateData);
        setCart(updatedCart);
      } catch (err) {
        logger.error("Erreur lors de la mise à jour de la quantité", err);
        const errorMsg =
          err instanceof Error
            ? err.message
            : "Erreur lors de la mise à jour de la quantité";
        // Ne pas afficher "Panier non trouvé" comme erreur, essayer de recharger le panier
        if (errorMsg.includes("Panier non trouvé")) {
          // Essayer de recharger le panier
          try {
            const cart = await getCart();
            setCart(cart);
          } catch (reloadError) {
            // Si le rechargement échoue aussi, ne pas afficher d'erreur
            console.warn(
              "Impossible de recharger le panier après erreur",
              reloadError
            );
          }
        } else {
          setError(errorMsg);
        }
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Supprime un article du panier
   * Le sessionId est géré automatiquement via cookie httpOnly
   */
  const removeFromCart = useCallback(
    async (productId: number) => {
      try {
        setIsLoading(true);
        setError(null);
        
        await removeCartItem(productId);
        // Recharger le panier après suppression
        await refreshCart();
      } catch (err) {
        logger.error("Erreur lors de la suppression de l'article", err);
        const errorMsg =
          err instanceof Error
            ? err.message
            : "Erreur lors de la suppression de l'article";
        // Ne pas afficher "Panier non trouvé" comme erreur, essayer de recharger le panier
        if (errorMsg.includes("Panier non trouvé")) {
          // Essayer de recharger le panier
          try {
            await refreshCart();
          } catch (reloadError) {
            // Si le rechargement échoue aussi, ne pas afficher d'erreur
            console.warn(
              "Impossible de recharger le panier après suppression",
              reloadError
            );
          }
        } else {
          setError(errorMsg);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [refreshCart]
  );

  /**
   * Vide complètement le panier
   * Le sessionId est géré automatiquement via cookie httpOnly
   */
  const clearCart = useCallback(async () => {
    await executeWithLoading(async () => {
      // Créer le DTO pour le vidage de panier (le sessionId sera extrait du cookie par le serveur)
      const clearData: CartClearDTO = {
        sessionId: "", // Sera ignoré côté serveur, extrait du cookie httpOnly
      };

      await clearCartService(clearData);
      setCart(null);
    }, "Erreur lors du vidage du panier");
  }, [executeWithLoading]);

  const value: CartContextType = {
    cart,
    itemCount,
    totals,
    isLoading,
    error,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
