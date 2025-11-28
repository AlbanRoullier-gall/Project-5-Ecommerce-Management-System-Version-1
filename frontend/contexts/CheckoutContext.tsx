import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { CustomerCreateDTO, AddressCreateDTO } from "../dto";
import { CartItemPublicDTO } from "./CartContext";

/**
 * Structure des données d'adresse pour le checkout
 */
interface AddressFormData {
  shipping: Partial<AddressCreateDTO>;
  billing: Partial<AddressCreateDTO>;
  useSameBillingAddress: boolean;
}

/**
 * Structure des données checkout stockées (sans currentStep - toujours initialisé à 1)
 */
interface CheckoutData {
  customerData: Partial<CustomerCreateDTO>;
  addressData: AddressFormData;
}

/**
 * Résultat de validation d'adresse
 */
export interface AddressValidationResult {
  isValid: boolean;
  error?: string;
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
 */
interface CheckoutContextType {
  // Données
  customerData: Partial<CustomerCreateDTO>;
  addressData: AddressFormData;

  // Actions générales
  updateCustomerData: (data: Partial<CustomerCreateDTO>) => void;

  // Actions spécifiques aux adresses
  updateShippingField: (field: string, value: string) => void;
  updateBillingField: (field: string, value: string) => void;
  setUseSameBillingAddress: (useSame: boolean) => void;
  validateAddresses: () => AddressValidationResult;

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

  // États du checkout
  const [customerData, setCustomerData] = useState<Partial<CustomerCreateDTO>>(
    {}
  );
  const [addressData, setAddressData] = useState<AddressFormData>({
    shipping: {} as Partial<AddressCreateDTO>,
    billing: {} as Partial<AddressCreateDTO>,
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
          setCustomerData(parsed.customerData || {});
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
   */
  const updateCustomerData = useCallback((data: Partial<CustomerCreateDTO>) => {
    setCustomerData((prev) => {
      return { ...prev, ...data };
    });
  }, []);

  /**
   * Met à jour un champ spécifique de l'adresse de livraison
   */
  const updateShippingField = useCallback((field: string, value: string) => {
    setAddressData((prev) => {
      const updatedShipping = {
        ...prev.shipping,
        [field]: value,
        addressType: "shipping" as const,
        countryName: prev.shipping.countryName || "Belgique",
      };

      return {
        ...prev,
        shipping: updatedShipping,
        // Si "même adresse", copier aussi dans billing
        billing: prev.useSameBillingAddress
          ? { ...updatedShipping, addressType: "billing" as const }
          : prev.billing,
      };
    });
  }, []);

  /**
   * Met à jour un champ spécifique de l'adresse de facturation
   */
  const updateBillingField = useCallback((field: string, value: string) => {
    setAddressData((prev) => {
      const updatedBilling = {
        ...prev.billing,
        [field]: value,
        addressType: "billing" as const,
        countryName: prev.billing.countryName || "Belgique",
      };

      return {
        ...prev,
        billing: updatedBilling,
      };
    });
  }, []);

  /**
   * Active/désactive l'utilisation de la même adresse pour la facturation
   */
  const setUseSameBillingAddress = useCallback((useSame: boolean) => {
    setAddressData((prev) => ({
      ...prev,
      useSameBillingAddress: useSame,
      // Si coché, copier l'adresse de livraison dans l'adresse de facturation
      billing: useSame
        ? { ...prev.shipping, addressType: "billing" as const }
        : prev.billing,
    }));
  }, []);

  /**
   * Valide les adresses de livraison et de facturation
   */
  const validateAddresses = useCallback((): AddressValidationResult => {
    // Validation des champs obligatoires de l'adresse de livraison
    if (
      !addressData.shipping.address ||
      !addressData.shipping.city ||
      !addressData.shipping.postalCode
    ) {
      return {
        isValid: false,
        error:
          "Veuillez remplir tous les champs obligatoires de l'adresse de livraison",
      };
    }

    // Validation des champs obligatoires de l'adresse de facturation si elle est différente
    if (
      !addressData.useSameBillingAddress &&
      (!addressData.billing.address ||
        !addressData.billing.city ||
        !addressData.billing.postalCode)
    ) {
      return {
        isValid: false,
        error:
          "Veuillez remplir tous les champs obligatoires de l'adresse de facturation",
      };
    }

    return { isValid: true };
  }, [addressData]);

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
        // Récupérer l'ID de session du panier depuis le localStorage
        const cartSessionId =
          (typeof window !== "undefined" &&
            window.localStorage.getItem("cart_session_id")) ||
          "";
        if (!cartSessionId) {
          return {
            success: false,
            error: "Session panier introuvable",
          };
        }

        // Appel unique vers l'endpoint d'orchestration du checkout
        const response = await fetch(`${API_URL}/api/checkout/complete`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cartSessionId,
            customerData,
            addressData,
            successUrl: `${window.location.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
            cancelUrl: `${window.location.origin}/checkout/cancel`,
          }),
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
    completeOrder,
  };

  return (
    <CheckoutContext.Provider value={value}>
      {children}
    </CheckoutContext.Provider>
  );
};
