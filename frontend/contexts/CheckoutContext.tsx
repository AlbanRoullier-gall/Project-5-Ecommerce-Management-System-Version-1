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
 * Gère l'état global du checkout avec persistance côté serveur (cart-service)
 */
export const CheckoutProvider: React.FC<CheckoutProviderProps> = ({
  children,
}) => {
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
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Charge les données checkout depuis le serveur au montage
   * Le sessionId est géré automatiquement via cookie httpOnly
   */
  useEffect(() => {
    if (typeof window === "undefined" || isInitialized) return;

    const loadCheckoutData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_URL}/api/cart/checkout-data`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include", // Important pour envoyer les cookies
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            const checkoutData = result.data;
            if (checkoutData.customerData) {
              setCustomerData(checkoutData.customerData);
            }
            if (checkoutData.addressData) {
              setAddressData(checkoutData.addressData);
            }
          }
        }
      } catch (error) {
        console.error("Error loading checkout data from server:", error);
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    loadCheckoutData();
  }, [isInitialized]);

  /**
   * Sauvegarde les données checkout sur le serveur
   * Le sessionId est géré automatiquement via cookie httpOnly
   */
  const saveToServer = useCallback(async (data: CheckoutData) => {
    try {
      await fetch(`${API_URL}/api/cart/checkout-data`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Important pour envoyer les cookies
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error("Error saving checkout data to server:", error);
    }
  }, []);

  /**
   * Met à jour les données client
   * Utilise CustomerResolveOrCreateDTO directement
   * Sauvegarde automatiquement sur le serveur
   */
  const updateCustomerData = useCallback(
    async (data: CustomerResolveOrCreateDTO) => {
      const updated = { ...customerData, ...data };
      setCustomerData(updated);
      // Sauvegarder sur le serveur de manière asynchrone
      if (isInitialized) {
        await saveToServer({
          customerData: updated,
          addressData,
        });
      }
    },
    [customerData, addressData, isInitialized, saveToServer]
  );

  /**
   * Met à jour un champ spécifique de l'adresse de livraison
   * Utilise AddressesCreateDTO directement
   * Sauvegarde automatiquement sur le serveur
   */
  const updateShippingField = useCallback(
    async (field: string, value: string) => {
      const updated = {
        ...addressData,
        shipping: {
          ...addressData.shipping,
          [field]: value,
          // countryName sera géré automatiquement par le service si non fourni
          ...(addressData.shipping?.countryName && {
            countryName: addressData.shipping.countryName,
          }),
        },
        // Ne pas copier automatiquement vers billing - la copie se fait uniquement via setUseSameBillingAddress
        billing: addressData.billing,
      };
      setAddressData(updated);
      // Sauvegarder sur le serveur de manière asynchrone
      if (isInitialized) {
        await saveToServer({
          customerData,
          addressData: updated,
        });
      }
    },
    [customerData, addressData, isInitialized, saveToServer]
  );

  /**
   * Met à jour un champ spécifique de l'adresse de facturation
   * Utilise AddressesCreateDTO directement
   * Sauvegarde automatiquement sur le serveur
   */
  const updateBillingField = useCallback(
    async (field: string, value: string) => {
      const updated = {
        ...addressData,
        billing: {
          ...addressData.billing,
          [field]: value,
          // countryName sera géré automatiquement par le service si non fourni
          ...(addressData.billing?.countryName && {
            countryName: addressData.billing.countryName,
          }),
        },
      };
      setAddressData(updated);
      // Sauvegarder sur le serveur de manière asynchrone
      if (isInitialized) {
        await saveToServer({
          customerData,
          addressData: updated,
        });
      }
    },
    [customerData, addressData, isInitialized, saveToServer]
  );

  /**
   * Active/désactive l'utilisation de la même adresse pour la facturation
   * Utilise AddressesCreateDTO directement
   * Le flag useSameBillingAddress est un indicateur uniquement
   * L'affichage utilisera l'adresse de livraison si le flag est coché
   * Sauvegarde automatiquement sur le serveur
   */
  const setUseSameBillingAddress = useCallback(
    async (useSame: boolean) => {
      const updated = {
        ...addressData,
        useSameBillingAddress: useSame,
        // Ne pas copier l'adresse - le flag est juste un indicateur
        // L'affichage utilisera shipping si useSameBillingAddress est true
        billing: addressData.billing,
      };
      setAddressData(updated);
      // Sauvegarder sur le serveur de manière asynchrone
      if (isInitialized) {
        await saveToServer({
          customerData,
          addressData: updated,
        });
      }
    },
    [customerData, addressData, isInitialized, saveToServer]
  );

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
  const validateCustomerData =
    useCallback(async (): Promise<CustomerValidationResult> => {
      try {
        const response = await fetch(`${API_URL}/api/customers/validate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include", // Important pour CORS avec credentials: true
          body: JSON.stringify(customerData),
        });

        const result = await response.json();

        if (!response.ok || !result.isValid) {
          return {
            isValid: false,
            errors: result.errors || [],
            generalError:
              result.message ||
              "Erreur lors de la validation des données client",
          };
        }

        return { isValid: true };
      } catch (error) {
        console.error(
          "Erreur lors de la validation des données client:",
          error
        );
        return {
          isValid: false,
          generalError: "Erreur lors de la validation des données client",
        };
      }
    }, [customerData]);

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

        // Les données checkout sont déjà sauvegardées sur le serveur
        // On envoie juste les URLs de redirection
        // Le serveur récupérera les données checkout depuis le cart-service
        const checkoutPayload: {
          successUrl: string;
          cancelUrl: string;
        } = {
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
    []
  );

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
