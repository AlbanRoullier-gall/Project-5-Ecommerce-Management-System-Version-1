import React, {
  createContext,
  useContext,
  useState,
  useEffect,
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
  const [sessionId, setSessionId] = useState<string | null>(null);

  /**
   * Extrait les totaux directement depuis le panier fourni par le cart-service
   * Le cart-service garantit toujours ces valeurs (subtotal, tax, total, vatBreakdown)
   */
  const totals: CartTotals = cart
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
      };

  /**
   * Initialise la session du panier
   * Le sessionId est maintenant géré automatiquement via cookie httpOnly
   * Plus besoin de localStorage ou de génération côté client
   * Le premier appel API créera automatiquement le cookie
   */
  useEffect(() => {
    // S'assurer qu'on est bien côté client
    if (typeof window === "undefined") return;

    // Le sessionId sera géré automatiquement par le cookie httpOnly
    // On peut charger le panier directement - le middleware créera le cookie si nécessaire
    // On utilise un flag pour indiquer que la session est initialisée
    setSessionId("initialized"); // Flag pour indiquer que c'est prêt
  }, []);

  /**
   * Charge le panier au montage
   * Le sessionId est géré automatiquement via cookie httpOnly
   */
  useEffect(() => {
    if (sessionId === "initialized") {
      refreshCart();
    }
  }, [sessionId]);

  /**
   * Utilise le nombre total d'articles calculé côté serveur
   * Le cart-service calcule déjà itemCount (somme des quantités)
   */
  const itemCount = cart?.itemCount || 0;

  /**
   * Récupère le panier depuis l'API
   * Le sessionId est géré automatiquement via cookie httpOnly
   */
  const refreshCart = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const cart = await getCart();
      setCart(cart);
    } catch (err) {
      logger.error("Erreur lors du chargement du panier", err);
      setError(
        err instanceof Error
          ? err.message
          : "Erreur lors du chargement du panier"
      );
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Ajoute un article au panier
   * Le sessionId est géré automatiquement via cookie httpOnly
   */
  const addToCart = async (
    productId: number,
    quantity: number,
    priceTTC: number,
    vatRate: number,
    productName: string, // Requis et non vide
    description?: string,
    imageUrl?: string
  ) => {
    setIsLoading(true);
    setError(null);

    try {
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
    } catch (err) {
      logger.error("Erreur lors de l'ajout au panier", err);
      setError(
        err instanceof Error ? err.message : "Erreur lors de l'ajout au panier"
      );
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Met à jour la quantité d'un article
   * Le sessionId est géré automatiquement via cookie httpOnly
   */
  const updateQuantity = async (productId: number, quantity: number) => {
    setIsLoading(true);
    setError(null);

    try {
      // Créer le DTO pour la mise à jour d'article
      const updateData: CartItemUpdateDTO = {
        quantity,
      };

      // Le service recharge automatiquement le panier
      const updatedCart = await updateCartItem(productId, updateData);
      setCart(updatedCart);
    } catch (err) {
      logger.error("Erreur lors de la mise à jour de la quantité", err);
      setError(
        err instanceof Error ? err.message : "Erreur lors de la mise à jour"
      );
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Supprime un article du panier
   * Le sessionId est géré automatiquement via cookie httpOnly
   */
  const removeFromCart = async (productId: number) => {
    setIsLoading(true);
    setError(null);

    try {
      await removeCartItem(productId);
      // Recharger le panier après suppression
      await refreshCart();
    } catch (err) {
      logger.error("Erreur lors de la suppression de l'article", err);
      setError(
        err instanceof Error ? err.message : "Erreur lors de la suppression"
      );
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Vide complètement le panier
   * Le sessionId est géré automatiquement via cookie httpOnly
   */
  const clearCart = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Créer le DTO pour le vidage de panier (le sessionId sera extrait du cookie par le serveur)
      const clearData: CartClearDTO = {
        sessionId: "", // Sera ignoré côté serveur, extrait du cookie httpOnly
      };

      await clearCartService(clearData);
      setCart(null);
    } catch (err) {
      logger.error("Erreur lors du vidage du panier", err);
      setError(
        err instanceof Error ? err.message : "Erreur lors du vidage du panier"
      );
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

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
