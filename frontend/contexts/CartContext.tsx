import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  CartPublicDTO,
  CartItemCreateDTO,
  CartItemUpdateDTO,
  CartClearDTO,
} from "../dto";

/**
 * URL de l'API depuis les variables d'environnement
 * OBLIGATOIRE : La variable NEXT_PUBLIC_API_URL doit être définie dans .env.local ou .env.production
 *
 * Exemples :
 * - Développement : NEXT_PUBLIC_API_URL=http://localhost:3020
 * - Production : NEXT_PUBLIC_API_URL=https://api.votre-domaine.com
 */
const API_URL = (() => {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (!url) {
    throw new Error(
      "NEXT_PUBLIC_API_URL n'est pas définie. Veuillez configurer cette variable d'environnement."
    );
  }
  return url;
})();

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
    productName?: string
  ) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  removeFromCart: (productId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
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
   * Calcule les totaux du panier
   */
  const calculateTotals = (cart: CartPublicDTO | null): CartTotals => {
    if (!cart || !cart.items || cart.items.length === 0) {
      return {
        totalHT: 0,
        totalTTC: cart?.total || 0,
        vatAmount: 0,
        breakdown: [],
      };
    }

    // Utiliser les totaux déjà calculés par le cart-service
    const totalHT = cart.subtotal || 0;
    const totalTTC = cart.total || 0;
    const vatAmount = cart.tax || 0;

    // Calculer le breakdown par taux de TVA pour l'affichage détaillé
    const vatByRate = new Map<number, number>();
    for (const item of cart.items) {
      const rate = item.vatRate ?? 0;
      const multiplier = 1 + rate / 100;
      const lineTotalTTC = item.price * item.quantity;
      const lineTotalHT = lineTotalTTC / multiplier;
      const vat = lineTotalTTC - lineTotalHT;

      vatByRate.set(rate, (vatByRate.get(rate) || 0) + vat);
    }

    const breakdown = Array.from(vatByRate.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([rate, amount]) => ({ rate, amount }));

    return { totalHT, totalTTC, vatAmount, breakdown };
  };

  // Calculer les totaux à chaque changement de panier
  const totals = calculateTotals(cart);

  /**
   * Génère ou récupère l'ID de session depuis localStorage
   * Uniquement côté client (pas SSR)
   */
  useEffect(() => {
    // S'assurer qu'on est bien côté client
    if (typeof window === "undefined") return;

    let storedSessionId = localStorage.getItem("cart_session_id");

    if (!storedSessionId) {
      // Générer un nouveau sessionId unique
      storedSessionId = `session_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      localStorage.setItem("cart_session_id", storedSessionId);
    }

    setSessionId(storedSessionId);
  }, []);

  /**
   * Charge le panier au montage et quand le sessionId change
   */
  useEffect(() => {
    if (sessionId) {
      refreshCart();
    }
  }, [sessionId]);

  /**
   * Calcule le nombre total d'articles dans le panier
   */
  const itemCount =
    cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  /**
   * Récupère le panier depuis l'API
   */
  const refreshCart = async () => {
    if (!sessionId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_URL}/api/cart?sessionId=${sessionId}`
      );

      if (response.status === 404) {
        // Pas de panier, c'est normal
        setCart(null);
        return;
      }

      if (!response.ok) {
        throw new Error("Erreur lors du chargement du panier");
      }

      const data = await response.json();
      setCart(data.cart);
    } catch (err) {
      console.error("Error loading cart:", err);
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
   */
  const addToCart = async (
    productId: number,
    quantity: number,
    priceTTC: number,
    vatRate: number,
    productName?: string
  ) => {
    if (!sessionId) {
      console.log("⚠️ Pas de sessionId, impossible d'ajouter au panier");
      return;
    }

    console.log(
      `➕ Ajout au panier: produit ${productId}, quantité ${quantity}, prix ${priceTTC}`
    );
    setIsLoading(true);
    setError(null);

    try {
      const url = `${API_URL}/api/cart/items?sessionId=${sessionId}`;
      console.log(`📡 POST ${url}`);

      // Créer le DTO pour l'ajout d'article
      const itemData: CartItemCreateDTO = {
        productId,
        productName,
        quantity,
        price: priceTTC,
        vatRate,
      };

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(itemData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ Erreur API:", errorData);
        throw new Error(
          errorData.message || "Erreur lors de l'ajout au panier"
        );
      }

      const result = await response.json();
      console.log("✅ Réponse ajout:", result);

      // Si la réponse contient directement le panier, on l'utilise
      if (result.cart) {
        console.log("✅ Panier mis à jour:", result.cart);
        setCart(result.cart);
      } else {
        // Sinon on recharge
        await refreshCart();
      }
    } catch (err) {
      console.error("❌ Error adding to cart:", err);
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
   */
  const updateQuantity = async (productId: number, quantity: number) => {
    if (!sessionId) return;

    setIsLoading(true);
    setError(null);

    try {
      // Créer le DTO pour la mise à jour d'article
      const updateData: CartItemUpdateDTO = {
        quantity,
      };

      const response = await fetch(
        `${API_URL}/api/cart/items/${productId}?sessionId=${sessionId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de la mise à jour");
      }

      await refreshCart();
    } catch (err) {
      console.error("Error updating quantity:", err);
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
   */
  const removeFromCart = async (productId: number) => {
    if (!sessionId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_URL}/api/cart/items/${productId}?sessionId=${sessionId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de la suppression");
      }

      await refreshCart();
    } catch (err) {
      console.error("Error removing from cart:", err);
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
   */
  const clearCart = async () => {
    if (!sessionId) return;

    setIsLoading(true);
    setError(null);

    try {
      // Créer le DTO pour le vidage de panier
      const clearData: CartClearDTO = {
        sessionId: sessionId,
      };

      const response = await fetch(`${API_URL}/api/cart`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(clearData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors du vidage du panier");
      }

      setCart(null);
    } catch (err) {
      console.error("Error clearing cart:", err);
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
    refreshCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
