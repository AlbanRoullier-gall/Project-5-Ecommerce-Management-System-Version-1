import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { CustomerResolveOrCreateDTO, AddressesCreateDTO } from "../dto";
import { CartItemPublicDTO } from "./CartContext";

/**
 * Structure des données checkout stockées (sans currentStep - toujours initialisé à 1)
 * Utilise les DTOs existants directement
 */
interface CheckoutData {
  customerData: CustomerResolveOrCreateDTO;
  addressData: AddressesCreateDTO;
}

/**
 * Résultat de validation d'adresse
 */
export interface AddressValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Erreur de validation par champ
 */
export interface FieldValidationError {
  field: string;
  message: string;
}

/**
 * Résultat de validation des données client
 */
export interface CustomerValidationResult {
  isValid: boolean;
  errors?: FieldValidationError[];
  generalError?: string;
}

/**
 * Résultat de la finalisation de commande
 */
export interface CompleteOrderResult {
  success: boolean;
  error?: string;
  paymentUrl?: string;
}

/**
 * Type du contexte Checkout
 * Utilise les DTOs existants directement
 */
interface CheckoutContextType {
  // Données
  customerData: CustomerResolveOrCreateDTO;
  addressData: AddressesCreateDTO;

  // Actions générales
  updateCustomerData: (data: CustomerResolveOrCreateDTO) => void;

  // Actions spécifiques aux adresses
  updateShippingField: (field: string, value: string) => void;
  updateBillingField: (field: string, value: string) => void;
  setUseSameBillingAddress: (useSame: boolean) => void;
  validateAddresses: () => Promise<AddressValidationResult>;

  // Action de validation des données client
  validateCustomerData: () => Promise<CustomerValidationResult>;

  // Action de finalisation de commande
  completeOrder: (
    cart: { items: CartItemPublicDTO[]; total: number } | null
  ) => Promise<CompleteOrderResult>;
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(
  undefined
);

/**
 * Clé pour le stockage dans sessionStorage
 */
const STORAGE_KEY = "checkout_data";

/**
 * URL de l'API depuis les variables d'environnement
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3020";

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

  // États du checkout - Utilise les DTOs existants directement
  const [customerData, setCustomerData] = useState<CustomerResolveOrCreateDTO>({
    email: "",
  });
  const [addressData, setAddressData] = useState<AddressesCreateDTO>({
    shipping: {},
    billing: {},
    useSameBillingAddress: true,
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
          setCustomerData(parsed.customerData || { email: "" });
          setAddressData(
            parsed.addressData || {
              shipping: {},
              billing: {},
              useSameBillingAddress: true,
            }
          );
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
   * Utilise CustomerResolveOrCreateDTO directement
   */
  const updateCustomerData = useCallback((data: CustomerResolveOrCreateDTO) => {
    setCustomerData((prev) => {
      return { ...prev, ...data };
    });
  }, []);

  /**
   * Met à jour un champ spécifique de l'adresse de livraison
   * Utilise AddressesCreateDTO directement
   */
  const updateShippingField = useCallback((field: string, value: string) => {
    setAddressData((prev) => {
      const updatedShipping = {
        ...prev.shipping,
        [field]: value,
        countryName: prev.shipping?.countryName || "Belgique",
      };

      return {
        ...prev,
        shipping: updatedShipping,
        // Si "même adresse", copier aussi dans billing
        billing: prev.useSameBillingAddress ? updatedShipping : prev.billing,
      };
    });
  }, []);

  /**
   * Met à jour un champ spécifique de l'adresse de facturation
   * Utilise AddressesCreateDTO directement
   */
  const updateBillingField = useCallback((field: string, value: string) => {
    setAddressData((prev) => {
      const updatedBilling = {
        ...prev.billing,
        [field]: value,
        countryName: prev.billing?.countryName || "Belgique",
      };

      return {
        ...prev,
        billing: updatedBilling,
      };
    });
  }, []);

  /**
   * Active/désactive l'utilisation de la même adresse pour la facturation
   * Utilise AddressesCreateDTO directement
   */
  const setUseSameBillingAddress = useCallback((useSame: boolean) => {
    setAddressData((prev) => ({
      ...prev,
      useSameBillingAddress: useSame,
      // Si coché, copier l'adresse de livraison dans l'adresse de facturation
      billing: useSame ? prev.shipping : prev.billing,
    }));
  }, []);

  /**
   * Valide les adresses de livraison et de facturation
   * Délègue la validation au service customer-service pour cohérence et sécurité
   */
  const validateAddresses =
    useCallback(async (): Promise<AddressValidationResult> => {
      try {
        const response = await fetch(
          `${API_URL}/api/customers/addresses/validate`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include", // Important pour CORS avec credentials: true
            body: JSON.stringify(addressData),
          }
        );

        const result = await response.json();

        if (!response.ok || !result.isValid) {
          return {
            isValid: false,
            error: result.error || "Erreur lors de la validation des adresses",
          };
        }

        return { isValid: true };
      } catch (error) {
        console.error("Erreur lors de la validation des adresses:", error);
        return {
          isValid: false,
          error: "Erreur lors de la validation des adresses",
        };
      }
    }, [addressData]);

  /**
   * Valide les données client
   * Délègue la validation au service customer-service pour cohérence et sécurité
   * Retourne les erreurs structurées par champ
   */
  const validateCustomerData = useCallback(
    async (): Promise<CustomerValidationResult> => {
      try {
        const response = await fetch(
          `${API_URL}/api/customers/validate`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include", // Important pour CORS avec credentials: true
            body: JSON.stringify(customerData),
          }
        );

        const result = await response.json();

        if (!response.ok || !result.isValid) {
          return {
            isValid: false,
            errors: result.errors || [],
            generalError:
              result.message || "Erreur lors de la validation des données client",
          };
        }

        return { isValid: true };
      } catch (error) {
        console.error("Erreur lors de la validation des données client:", error);
        return {
          isValid: false,
          generalError: "Erreur lors de la validation des données client",
        };
      }
    },
    [customerData]
  );

  /**
   * Fonction principale pour finaliser la commande
   * Délègue toute l'orchestration à l'API Gateway
   */
  const completeOrder = useCallback(
    async (
      cart: { items: CartItemPublicDTO[]; total: number } | null
    ): Promise<CompleteOrderResult> => {
      if (!cart) {
        return {
          success: false,
          error: "Votre panier est vide",
        };
      }

      try {
        // Le cartSessionId est maintenant géré automatiquement via cookie httpOnly
        // Plus besoin de le récupérer depuis localStorage ou de l'envoyer dans le header
        // Le cookie sera envoyé automatiquement par le navigateur

        // Appel unique vers l'endpoint d'orchestration du checkout
        // Utilise les DTOs existants directement : CustomerResolveOrCreateDTO et AddressesCreateDTO
        const checkoutPayload: {
          customerData: CustomerResolveOrCreateDTO;
          addressData: AddressesCreateDTO;
          successUrl: string;
          cancelUrl: string;
        } = {
          customerData,
          addressData,
          successUrl: `${window.location.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/checkout/cancel`,
        };

        const response = await fetch(`${API_URL}/api/checkout/complete`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Le cookie sera envoyé automatiquement par le navigateur
          },
          credentials: "include", // Important pour envoyer les cookies
          body: JSON.stringify(checkoutPayload),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          return {
            success: false,
            error:
              errorData.message ||
              errorData.error ||
              "Erreur lors de la finalisation de la commande",
          };
        }

        const data = await response.json();

        if (data.success && data.paymentUrl) {
          return {
            success: true,
            paymentUrl: data.paymentUrl,
          };
        } else {
          return {
            success: false,
            error: "URL de paiement non reçue",
          };
        }
      } catch (err) {
        console.error("Error completing order:", err);
        return {
          success: false,
          error: err instanceof Error ? err.message : "Une erreur est survenue",
        };
      }
    },
    [customerData, addressData]
  );

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
    updateShippingField,
    updateBillingField,
    setUseSameBillingAddress,
    validateAddresses,
    validateCustomerData,
    completeOrder,
  };

  return (
    <CheckoutContext.Provider value={value}>
      {children}
    </CheckoutContext.Provider>
  );
};
