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
 * Structure des données checkout complètes stockées
 */
interface CheckoutData {
  customerData: Partial<CustomerCreateDTO>;
  addressData: AddressFormData;
  currentStep: number;
}

/**
 * Type du contexte Checkout
 */
interface CheckoutContextType {
  // Données
  customerData: Partial<CustomerCreateDTO>;
  addressData: AddressFormData;
  currentStep: number;

  // Actions
  updateCustomerData: (data: Partial<CustomerCreateDTO>) => void;
  updateAddressData: (data: AddressFormData) => void;
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  previousStep: () => void;
  resetCheckout: () => void;

  // Helpers
  goToCustomerStep: () => void;
  goToAddressStep: () => void;
  goToPaymentStep: () => void;
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
  const [currentStep, setCurrentStepState] = useState<number>(1);
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
          setCustomerData(parsed.customerData || {});
          setAddressData(parsed.addressData || { shipping: {} });
          setCurrentStepState(parsed.currentStep || 1);
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
   * Met à jour l'étape courante
   */
  const setCurrentStep = useCallback((step: number) => {
    setCurrentStepState(step);
  }, []);

  /**
   * Passe à l'étape suivante
   */
  const nextStep = useCallback(() => {
    setCurrentStepState((prev) => {
      if (prev < 3) {
        return prev + 1;
      }
      return prev;
    });
  }, []);

  /**
   * Revient à l'étape précédente
   */
  const previousStep = useCallback(() => {
    setCurrentStepState((prev) => {
      if (prev > 1) {
        return prev - 1;
      }
      return prev;
    });
  }, []);

  /**
   * Réinitialise toutes les données checkout
   */
  const resetCheckout = useCallback(() => {
    setCustomerData({});
    setAddressData({ shipping: {} });
    setCurrentStepState(1);

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

  /**
   * Helpers pour naviguer vers des étapes spécifiques
   */
  const goToCustomerStep = useCallback(() => {
    setCurrentStepState(1);
  }, []);

  const goToAddressStep = useCallback(() => {
    setCurrentStepState(2);
  }, []);

  const goToPaymentStep = useCallback(() => {
    setCurrentStepState(3);
  }, []);

  // Sauvegarder automatiquement quand les données changent
  useEffect(() => {
    if (isInitialized) {
      saveToStorage({
        customerData,
        addressData,
        currentStep,
      });
    }
  }, [customerData, addressData, currentStep, isInitialized, saveToStorage]);

  const value: CheckoutContextType = {
    customerData,
    addressData,
    currentStep,
    updateCustomerData,
    updateAddressData,
    setCurrentStep,
    nextStep,
    previousStep,
    resetCheckout,
    goToCustomerStep,
    goToAddressStep,
    goToPaymentStep,
  };

  return (
    <CheckoutContext.Provider value={value}>
      {children}
    </CheckoutContext.Provider>
  );
};
