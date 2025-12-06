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
import {
  getCheckoutData,
  saveCheckoutData as saveCheckoutDataService,
  validateAddresses as validateAddressesService,
  validateCustomerData as validateCustomerDataService,
  completeCheckout,
  type AddressValidationResult,
  type CustomerValidationResult,
  type CompleteOrderResult,
} from "../services/checkoutService";
import { logger } from "../services/logger";
import {
  validateBelgianAddressFields,
  validateBelgianCustomerData,
} from "../utils/belgiumValidation";

// Réexporter les types pour faciliter l'utilisation dans les composants
export type {
  AddressValidationResult,
  CustomerValidationResult,
  CompleteOrderResult,
};

/**
 * Type du contexte Checkout
 * Utilise les DTOs existants directement
 */
interface CheckoutContextType {
  // Données
  customerData: CustomerResolveOrCreateDTO;
  addressData: AddressesCreateDTO;
  isLoading: boolean;

  // Actions générales
  updateCustomerData: (data: CustomerResolveOrCreateDTO) => void;
  saveCheckoutData: () => Promise<void>;

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
   * Le countryName vient uniquement du backend
   */
  useEffect(() => {
    if (typeof window === "undefined" || isInitialized) return;

    const loadCheckoutData = async () => {
      setIsLoading(true);
      try {
        const checkoutData = await getCheckoutData();
        if (checkoutData) {
          if (checkoutData.customerData) {
            setCustomerData(checkoutData.customerData);
          }
          if (checkoutData.addressData) {
            setAddressData(checkoutData.addressData);
          }
        }
      } catch (error) {
        logger.error("Error loading checkout data from server", error);
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    loadCheckoutData();
  }, [isInitialized]);

  /**
   * Sauvegarde explicite des données checkout actuelles
   * À appeler avant la navigation entre étapes du checkout
   * Le sessionId est géré automatiquement via cookie httpOnly
   * Le countryName vient uniquement du backend
   */
  const saveCheckoutData = useCallback(async () => {
    if (!isInitialized) {
      return; // Ne pas sauvegarder si le contexte n'est pas encore initialisé
    }
    try {
      await saveCheckoutDataService({
        customerData,
        addressData,
      });
    } catch (error) {
      logger.error("Error saving checkout data to server", error);
      throw error; // Propager l'erreur pour que l'appelant puisse la gérer
    }
  }, [customerData, addressData, isInitialized]);

  /**
   * Met à jour les données client
   * Utilise CustomerResolveOrCreateDTO directement
   */
  const updateCustomerData = useCallback((data: CustomerResolveOrCreateDTO) => {
    setCustomerData((prev) => ({ ...prev, ...data }));
  }, []);

  /**
   * Met à jour un champ d'une adresse (livraison ou facturation)
   * Centralise la logique pour éviter la duplication
   * Le countryName vient uniquement du backend
   */
  const updateAddressField = useCallback(
    (type: "shipping" | "billing", field: string, value: string) => {
      setAddressData((prev) => ({
        ...prev,
        [type]: {
          ...prev[type],
          [field]: value,
        },
      }));
    },
    []
  );

  /**
   * Met à jour un champ spécifique de l'adresse de livraison
   */
  const updateShippingField = useCallback(
    (field: string, value: string) => {
      updateAddressField("shipping", field, value);
    },
    [updateAddressField]
  );

  /**
   * Met à jour un champ spécifique de l'adresse de facturation
   */
  const updateBillingField = useCallback(
    (field: string, value: string) => {
      updateAddressField("billing", field, value);
    },
    [updateAddressField]
  );

  /**
   * Active/désactive l'utilisation de la même adresse pour la facturation
   * Le flag useSameBillingAddress est un indicateur uniquement
   * L'affichage utilisera l'adresse de livraison si le flag est coché
   */
  const setUseSameBillingAddress = useCallback((useSame: boolean) => {
    setAddressData((prev) => ({
      ...prev,
      useSameBillingAddress: useSame,
    }));
  }, []);

  /**
   * Valide les adresses de livraison et de facturation
   * Effectue d'abord une validation locale (format belge), puis délègue au backend
   * Retourne les erreurs par champ pour affichage sous chaque champ
   */
  const validateAddresses = useCallback(async (): Promise<
    AddressValidationResult & { fieldErrors?: Record<string, string> }
  > => {
    // Validation locale pour la Belgique
    const shippingValidation = validateBelgianAddressFields(
      addressData.shipping || {}
    );
    const billingValidation = addressData.useSameBillingAddress
      ? { isValid: true, errors: {} }
      : validateBelgianAddressFields(addressData.billing || {});

    // Si validation locale échoue, retourner les erreurs par champ
    if (!shippingValidation.isValid || !billingValidation.isValid) {
      const fieldErrors: Record<string, string> = {};

      // Erreurs de shipping
      Object.keys(shippingValidation.errors).forEach((key) => {
        fieldErrors[`shipping.${key}`] = shippingValidation.errors[key];
      });

      // Erreurs de billing
      Object.keys(billingValidation.errors).forEach((key) => {
        fieldErrors[`billing.${key}`] = billingValidation.errors[key];
      });

      return {
        isValid: false,
        error: Object.values(fieldErrors).join(", "),
        fieldErrors,
      };
    }

    // Si validation locale réussit, valider côté serveur
    const serverValidation = await validateAddressesService(addressData);

    // Si le serveur retourne une erreur générale, on la garde
    // Sinon on retourne le résultat tel quel
    return serverValidation;
  }, [addressData]);

  /**
   * Valide les données client
   * Effectue d'abord une validation locale (format belge), puis délègue au backend
   * Retourne les erreurs structurées par champ
   */
  const validateCustomerData =
    useCallback(async (): Promise<CustomerValidationResult> => {
      // Validation locale pour la Belgique
      const localValidation = validateBelgianCustomerData(customerData);

      // Si validation locale échoue, retourner les erreurs
      if (!localValidation.isValid) {
        return {
          isValid: false,
          errors: Object.keys(localValidation.errors).map((field) => ({
            field,
            message: localValidation.errors[field],
          })),
        };
      }

      // Si validation locale réussit, valider côté serveur
      return validateCustomerDataService(customerData);
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

      return completeCheckout(checkoutPayload);
    },
    []
  );

  const value: CheckoutContextType = {
    customerData,
    addressData,
    isLoading,
    updateCustomerData,
    saveCheckoutData,
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
