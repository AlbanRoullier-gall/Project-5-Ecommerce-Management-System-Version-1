import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { CustomerCreateDTO, AddressCreateDTO } from "../dto";

/**
 * Structure des données d'adresse pour le checkout
 */
interface AddressFormData {
  shipping: Partial<AddressCreateDTO>;
}

/**
 * Structure des données checkout stockées (sans currentStep - toujours initialisé à 1)
 */
interface CheckoutData {
  customerData: Partial<CustomerCreateDTO>;
  addressData: AddressFormData;
}

/**
 * Type du contexte Checkout
 * Simplifié : plus de gestion d'étapes, uniquement les données
 */
interface CheckoutContextType {
  // Données
  customerData: Partial<CustomerCreateDTO>;
  addressData: AddressFormData;

  // Actions
  updateCustomerData: (data: Partial<CustomerCreateDTO>) => void;
  updateAddressData: (data: AddressFormData) => void;
  resetCheckout: () => void;
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(
  undefined
);

/**
 * Clé pour le stockage dans sessionStorage
 */
const STORAGE_KEY = "checkout_data";

/**
 * Hook pour utiliser le contexte checkout
 */
export const useCheckout = () => {
  const context = useContext(CheckoutContext);
  if (!context) {
    throw new Error("useCheckout doit être utilisé dans un CheckoutProvider");
  }
  return context;
};

interface CheckoutProviderProps {
  children: ReactNode;
}

/**
 * Provider du contexte checkout
 * Gère l'état global du checkout avec persistance dans sessionStorage
 */
export const CheckoutProvider: React.FC<CheckoutProviderProps> = ({
  children,
}) => {
  // Récupérer la sessionId depuis CartContext
  // On utilise useCart pour accéder à la sessionId si disponible
  // Pour l'instant, on va lire directement depuis localStorage pour rester indépendant
  const [sessionId, setSessionId] = useState<string | null>(null);

  // États du checkout
  const [customerData, setCustomerData] = useState<Partial<CustomerCreateDTO>>(
    {}
  );
  const [addressData, setAddressData] = useState<AddressFormData>({
    shipping: {} as Partial<AddressCreateDTO>,
  });
  const [isInitialized, setIsInitialized] = useState(false);

  /**
   * Charge la sessionId depuis localStorage au montage
   */
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedSessionId = localStorage.getItem("cart_session_id");
      setSessionId(storedSessionId);
    }
  }, []);

  /**
   * Charge les données checkout depuis sessionStorage au montage
   * Note: currentStep n'est jamais restauré - on commence toujours à l'étape 1
   */
  useEffect(() => {
    if (typeof window === "undefined" || isInitialized) return;

    // Charger les données une fois que sessionId est disponible
    if (!sessionId) return;

    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: CheckoutData = JSON.parse(stored);

        // Vérifier que la sessionId correspond à celle stockée
        const storedSessionId = localStorage.getItem("cart_session_id");
        if (parsed && storedSessionId === sessionId) {
          // Restaurer uniquement les données, pas l'étape (toujours commencer à 1)
          setCustomerData(parsed.customerData || {});
          setAddressData(parsed.addressData || { shipping: {} });
          // currentStep reste à 1 (valeur par défaut)
        } else if (storedSessionId !== sessionId) {
          // Si la sessionId a changé, nettoyer les données
          sessionStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch (error) {
      console.error("Error loading checkout data from sessionStorage:", error);
    } finally {
      setIsInitialized(true);
    }
  }, [sessionId, isInitialized]);

  /**
   * Sauvegarde les données checkout dans sessionStorage
   */
  const saveToStorage = useCallback((data: CheckoutData) => {
    if (typeof window === "undefined") return;

    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error("Error saving checkout data to sessionStorage:", error);
    }
  }, []);

  /**
   * Met à jour les données client
   */
  const updateCustomerData = useCallback((data: Partial<CustomerCreateDTO>) => {
    setCustomerData((prev) => {
      return { ...prev, ...data };
    });
  }, []);

  /**
   * Met à jour les données d'adresse
   */
  const updateAddressData = useCallback((data: AddressFormData) => {
    setAddressData((prev) => {
      return { ...prev, ...data };
    });
  }, []);

  /**
   * Réinitialise toutes les données checkout
   */
  const resetCheckout = useCallback(() => {
    setCustomerData({});
    setAddressData({ shipping: {} });

    if (typeof window !== "undefined") {
      try {
        sessionStorage.removeItem(STORAGE_KEY);
      } catch (error) {
        console.error(
          "Error clearing checkout data from sessionStorage:",
          error
        );
      }
    }
  }, []);

  // Sauvegarder automatiquement quand les données changent (sans currentStep)
  useEffect(() => {
    if (isInitialized) {
      saveToStorage({
        customerData,
        addressData,
      });
    }
  }, [customerData, addressData, isInitialized, saveToStorage]);

  const value: CheckoutContextType = {
    customerData,
    addressData,
    updateCustomerData,
    updateAddressData,
    resetCheckout,
  };

  return (
    <CheckoutContext.Provider value={value}>
      {children}
    </CheckoutContext.Provider>
  );
};
