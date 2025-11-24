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
   * Helper pour créer un DTO d'adresse
   */
  const createAddressDTO = useCallback(
    (
      address: Partial<AddressCreateDTO>,
      addressType: "shipping" | "billing",
      isDefault: boolean
    ): AddressCreateDTO => ({
      addressType,
      address: address.address || "",
      postalCode: address.postalCode || "",
      city: address.city || "",
      countryName: address.countryName || "Belgique",
      isDefault,
    }),
    []
  );

  /**
   * Helper pour sauvegarder une adresse dans le carnet d'adresses du client
   */
  const saveAddressToCustomer = useCallback(
    async (
      customerId: number,
      addressDTO: AddressCreateDTO,
      addressType: "shipping" | "billing"
    ): Promise<void> => {
      const response = await fetch(
        `${API_URL}/api/customers/${customerId}/addresses`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(addressDTO),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (
          response.status === 409 &&
          errorData.message?.includes("already exists")
        ) {
          console.log(
            `${addressType} address already exists in customer address book`
          );
        } else {
          console.warn(
            `Failed to save ${addressType} address to customer address book:`,
            errorData.message
          );
        }
      } else {
        console.log(`${addressType} address saved to customer address book`);
      }
    },
    []
  );

  /**
   * Fonction principale pour finaliser la commande
   *
   * Processus complet :
   * 1. Vérifie si le client existe déjà (par email), sinon le crée
   * 2. Sauvegarde les adresses dans le carnet d'adresses du client
   * 3. Prépare les données de paiement
   * 4. Crée une session de paiement Stripe
   * 5. Retourne l'URL de redirection vers Stripe
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
        let customerId: number;

        // Étape 1 : Vérifier si le client existe déjà (recherche par email)
        const emailEncoded = encodeURIComponent(customerData.email || "");
        const existingCustomerResponse = await fetch(
          `${API_URL}/api/customers/by-email/${emailEncoded}`
        );

        if (existingCustomerResponse.ok) {
          // Client existant : récupérer ses informations
          const existingData = await existingCustomerResponse.json();
          customerId = existingData.customer.customerId;
        } else {
          // Client inexistant : créer un nouveau client
          const customerResponse = await fetch(`${API_URL}/api/customers`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(customerData),
          });

          if (!customerResponse.ok) {
            const errorData = await customerResponse.json();
            return {
              success: false,
              error:
                errorData.message || "Erreur lors de la création du client",
            };
          }

          const customerResponseData = await customerResponse.json();
          customerId = customerResponseData.customer.customerId;
        }

        // Étape 2 : Sauvegarder les adresses dans le carnet d'adresses du client
        // Cette étape est non-bloquante : si elle échoue, on continue quand même
        try {
          const shippingAddress = addressData.shipping;
          const billingAddress = addressData.useSameBillingAddress
            ? addressData.shipping
            : addressData.billing;

          // Créer l'adresse de livraison (toujours définie comme adresse par défaut)
          if (
            shippingAddress?.address &&
            shippingAddress?.postalCode &&
            shippingAddress?.city
          ) {
            const shippingAddressDTO = createAddressDTO(
              shippingAddress,
              "shipping",
              true
            );
            await saveAddressToCustomer(
              customerId,
              shippingAddressDTO,
              "shipping"
            );
          }

          // Créer l'adresse de facturation uniquement si elle est différente de l'adresse de livraison
          if (
            billingAddress?.address &&
            billingAddress?.postalCode &&
            billingAddress?.city &&
            !addressData.useSameBillingAddress &&
            billingAddress.address !== shippingAddress?.address
          ) {
            const billingAddressDTO = createAddressDTO(
              billingAddress,
              "billing",
              false
            );
            await saveAddressToCustomer(
              customerId,
              billingAddressDTO,
              "billing"
            );
          }
        } catch (addressError) {
          // Erreur non-bloquante : on continue même si la sauvegarde des adresses échoue
          console.error(
            "Address book save error (non-blocking):",
            addressError
          );
        }

        // Étape 3 : Préparer les données de paiement pour Stripe
        const paymentItems = cart.items.map((item) => ({
          name: item.productName || "Produit",
          description: item.description || "",
          price: Math.round(item.unitPriceTTC * 100),
          quantity: item.quantity,
          currency: "eur",
        }));

        // Étape 4 : Construire le snapshot checkout à attacher au panier
        // Le snapshot contient toutes les informations de la commande pour référence future
        const shippingAddress = addressData.shipping;
        const billingAddress = addressData.useSameBillingAddress
          ? addressData.shipping
          : addressData.billing;

        const snapshot = {
          customer: {
            ...customerData,
          },
          shippingAddress: {
            firstName: customerData.firstName || "",
            lastName: customerData.lastName || "",
            address: shippingAddress.address || "",
            city: shippingAddress.city || "",
            postalCode: shippingAddress.postalCode || "",
            country: shippingAddress.countryName,
            phone: customerData.phoneNumber || "",
          },
          billingAddress:
            billingAddress.address !== shippingAddress.address
              ? {
                  firstName: customerData.firstName || "",
                  lastName: customerData.lastName || "",
                  address: billingAddress.address || "",
                  city: billingAddress.city || "",
                  postalCode: billingAddress.postalCode || "",
                  country: billingAddress.countryName,
                  phone: customerData.phoneNumber || "",
                }
              : null,
          notes: undefined,
        };

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

        // Étape 5 : Préparer le payload pour créer la session de paiement Stripe
        const paymentCreatePayload = {
          cartSessionId,
          snapshot,
          payment: {
            customer: {
              email: customerData.email || "",
              name: `${customerData.firstName} ${customerData.lastName}`,
              phone: customerData.phoneNumber,
            },
            items: paymentItems,
            successUrl: `${window.location.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
            cancelUrl: `${window.location.origin}/checkout/cancel`,
            metadata: {
              customerId: customerId.toString(),
            },
          },
        };

        // Étape 6 : Créer la session de paiement Stripe
        const paymentResponse = await fetch(`${API_URL}/api/payment/create`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(paymentCreatePayload),
        });

        if (!paymentResponse.ok) {
          const errorData = await paymentResponse.json();
          return {
            success: false,
            error:
              errorData.message || "Erreur lors de la création du paiement",
          };
        }

        const paymentResult = await paymentResponse.json();
        const url = paymentResult.url || paymentResult.payment?.url;

        // Étape 7 : Retourner l'URL de paiement
        if (url) {
          return {
            success: true,
            paymentUrl: url,
          };
        } else {
          return {
            success: false,
            error: "URL de paiement non reçue",
          };
        }
      } catch (err) {
        // Gestion des erreurs
        console.error("Error completing order:", err);
        return {
          success: false,
          error: err instanceof Error ? err.message : "Une erreur est survenue",
        };
      }
    },
    [customerData, addressData, createAddressDTO, saveAddressToCustomer]
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
