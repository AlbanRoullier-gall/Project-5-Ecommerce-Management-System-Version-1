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
  type CheckoutData,
  type AddressValidationResult,
  type CustomerValidationResult,
  type CompleteOrderResult,
} from "../services/checkoutService";
import { logger } from "../services/logger";

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
            // Le backend garantit toujours countryName = "Belgique"
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
   * Sauvegarde les données checkout sur le serveur
   * Le sessionId est géré automatiquement via cookie httpOnly
   */
  const saveToServer = useCallback(async (data: CheckoutData) => {
    try {
      await saveCheckoutDataService(data);
    } catch (error) {
      logger.error("Error saving checkout data to server", error);
      throw error; // Propager l'erreur pour que l'appelant puisse la gérer
    }
  }, []);

  /**
   * Sauvegarde explicite des données checkout actuelles
   * À appeler avant la navigation entre étapes du checkout
   */
  const saveCheckoutData = useCallback(async () => {
    if (!isInitialized) {
      return; // Ne pas sauvegarder si le contexte n'est pas encore initialisé
    }
    await saveToServer({
      customerData,
      addressData,
    });
  }, [customerData, addressData, isInitialized, saveToServer]);

  /**
   * Met à jour les données client
   * Utilise CustomerResolveOrCreateDTO directement
   * Ne sauvegarde plus automatiquement - la sauvegarde se fait lors de la navigation entre étapes
   */
  const updateCustomerData = useCallback(
    (data: CustomerResolveOrCreateDTO) => {
      const updated = { ...customerData, ...data };
      setCustomerData(updated);
    },
    [customerData]
  );

  /**
   * Met à jour un champ spécifique de l'adresse de livraison
   * Utilise AddressesCreateDTO directement
   * Ne sauvegarde plus automatiquement - la sauvegarde se fait lors de la navigation entre étapes
   */
  const updateShippingField = useCallback(
    (field: string, value: string) => {
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
    },
    [addressData]
  );

  /**
   * Met à jour un champ spécifique de l'adresse de facturation
   * Utilise AddressesCreateDTO directement
   * Ne sauvegarde plus automatiquement - la sauvegarde se fait lors de la navigation entre étapes
   */
  const updateBillingField = useCallback(
    (field: string, value: string) => {
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
    },
    [addressData]
  );

  /**
   * Active/désactive l'utilisation de la même adresse pour la facturation
   * Utilise AddressesCreateDTO directement
   * Le flag useSameBillingAddress est un indicateur uniquement
   * L'affichage utilisera l'adresse de livraison si le flag est coché
   * Ne sauvegarde plus automatiquement - la sauvegarde se fait lors de la navigation entre étapes
   */
  const setUseSameBillingAddress = useCallback(
    (useSame: boolean) => {
      const updated = {
        ...addressData,
        useSameBillingAddress: useSame,
        // Ne pas copier l'adresse - le flag est juste un indicateur
        // L'affichage utilisera shipping si useSameBillingAddress est true
        billing: addressData.billing,
      };
      setAddressData(updated);
    },
    [addressData]
  );

  /**
   * Valide les adresses de livraison et de facturation
   * Délègue la validation au service customer-service pour cohérence et sécurité
   */
  const validateAddresses =
    useCallback(async (): Promise<AddressValidationResult> => {
      return validateAddressesService(addressData);
    }, [addressData]);

  /**
   * Valide les données client
   * Délègue la validation au service customer-service pour cohérence et sécurité
   * Retourne les erreurs structurées par champ
   */
  const validateCustomerData =
    useCallback(async (): Promise<CustomerValidationResult> => {
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
