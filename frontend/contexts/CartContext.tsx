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

// Export CartItemPublicDTO pour faciliter l'utilisation dans les composants
export type { CartItemPublicDTO };

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

/**
 * Helper pour les logs de debug (uniquement en développement)
 */
const debugLog = (...args: any[]) => {
  if (process.env.NODE_ENV === "development") {
    console.log(...args);
  }
};

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
   * Construit les headers pour les requêtes cart
   * Le sessionId est maintenant géré automatiquement via cookie httpOnly
   * Plus besoin d'envoyer le header X-Cart-Session-ID
   */
  const buildCartHeaders = (): Record<string, string> => {
    return {
      "Content-Type": "application/json",
      // Le cookie sera envoyé automatiquement par le navigateur
    };
  };

  /**
   * Récupère le panier depuis l'API
   * Le sessionId est transmis via le header X-Cart-Session-ID
   */
  const refreshCart = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/cart`, {
        method: "GET",
        headers: buildCartHeaders(),
        credentials: "include", // Important pour envoyer les cookies
      });

      // Le sessionId est maintenant géré automatiquement via cookie httpOnly
      // Plus besoin de récupérer ou stocker le sessionId

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
      console.error("Erreur lors du chargement du panier:", err);
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
   * Le sessionId est transmis via le header X-Cart-Session-ID
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
    debugLog(
      `➕ Ajout au panier: produit ${productId}, quantité ${quantity}, prix ${priceTTC}`
    );
    setIsLoading(true);
    setError(null);

    try {
      const url = `${API_URL}/api/cart/items`;
      debugLog(`📡 POST ${url}`);

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

      const response = await fetch(url, {
        method: "POST",
        headers: buildCartHeaders(),
        credentials: "include", // Important pour envoyer les cookies
        body: JSON.stringify(itemData),
      });

      // Le sessionId est maintenant géré automatiquement via cookie httpOnly
      // Plus besoin de récupérer ou stocker le sessionId

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Erreur lors de l'ajout au panier:", errorData);
        throw new Error(
          errorData.message || "Erreur lors de l'ajout au panier"
        );
      }

      const result = await response.json();

      // Utiliser le panier de la réponse s'il est présent, sinon recharger
      if (result.cart) {
        debugLog("✅ Panier mis à jour depuis la réponse");
        setCart(result.cart);
      } else {
        debugLog("⚠️ Pas de panier dans la réponse, rechargement...");
        await refreshCart();
      }
    } catch (err) {
      console.error("Erreur lors de l'ajout au panier:", err);
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
   * Le sessionId est transmis via le header X-Cart-Session-ID
   */
  const updateQuantity = async (productId: number, quantity: number) => {
    setIsLoading(true);
    setError(null);

    try {
      // Créer le DTO pour la mise à jour d'article
      const updateData: CartItemUpdateDTO = {
        quantity,
      };

      const response = await fetch(`${API_URL}/api/cart/items/${productId}`, {
        method: "PUT",
        headers: buildCartHeaders(),
        credentials: "include", // Important pour envoyer les cookies
        body: JSON.stringify(updateData),
      });

      // Le sessionId est maintenant géré automatiquement via cookie httpOnly
      // Plus besoin de récupérer ou stocker le sessionId

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de la mise à jour");
      }

      await refreshCart();
    } catch (err) {
      console.error("Erreur lors de la mise à jour de la quantité:", err);
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
   * Le sessionId est transmis via le header X-Cart-Session-ID
   */
  const removeFromCart = async (productId: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/cart/items/${productId}`, {
        method: "DELETE",
        headers: buildCartHeaders(),
        credentials: "include", // Important pour envoyer les cookies
      });

      // Le sessionId est maintenant géré automatiquement via cookie httpOnly
      // Plus besoin de récupérer ou stocker le sessionId

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de la suppression");
      }

      await refreshCart();
    } catch (err) {
      console.error("Erreur lors de la suppression de l'article:", err);
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
   * Le sessionId est transmis via le header X-Cart-Session-ID
   */
  const clearCart = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Créer le DTO pour le vidage de panier (le sessionId sera extrait du cookie par le serveur)
      const clearData: CartClearDTO = {
        sessionId: "", // Sera ignoré côté serveur, extrait du cookie httpOnly
      };

      const response = await fetch(`${API_URL}/api/cart`, {
        method: "DELETE",
        headers: buildCartHeaders(),
        credentials: "include", // Important pour envoyer les cookies
        body: JSON.stringify(clearData),
      });

      // Le sessionId est maintenant géré automatiquement via cookie httpOnly
      // Plus besoin de récupérer ou stocker le sessionId

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors du vidage du panier");
      }

      setCart(null);
    } catch (err) {
      console.error("Erreur lors du vidage du panier:", err);
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
