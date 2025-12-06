/**
 * Hook pour gérer le formulaire de checkout - adresses
 */

import { useState, useCallback } from "react";
import { useRouter } from "next/router";
import { useCheckout } from "../../contexts/CheckoutContext";
import { logger } from "../../services/logger";

interface UseCheckoutAddressFormResult {
  addressData: {
    shipping: any;
    billing: any;
    useSameBillingAddress: boolean;
  };
  isLoading: boolean;
  error: string | null;
  fieldErrors: { [key: string]: string };
  handleShippingFieldChange: (field: string, value: string) => void;
  handleBillingFieldChange: (field: string, value: string) => void;
  handleUseSameBillingAddressChange: (checked: boolean) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleBack: () => void;
  clearError: (fieldName?: string) => void;
}

/**
 * Hook pour gérer l'état et la logique du formulaire de checkout - adresses
 */
export function useCheckoutAddressForm(): UseCheckoutAddressFormResult {
  const router = useRouter();
  const {
    addressData,
    updateShippingField,
    updateBillingField,
    setUseSameBillingAddress,
    validateAddresses,
    saveCheckoutData,
  } = useCheckout();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  const handleShippingFieldChange = useCallback(
    (field: string, value: string) => {
      updateShippingField(field, value);
      // Effacer l'erreur du champ modifié
      const errorKey = `shipping.${field}`;
      if (fieldErrors[errorKey]) {
        setFieldErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[errorKey];
          return newErrors;
        });
      }
      // Effacer l'erreur générale si présente
      if (error) {
        setError(null);
      }
    },
    [updateShippingField, fieldErrors, error]
  );

  const handleBillingFieldChange = useCallback(
    (field: string, value: string) => {
      updateBillingField(field, value);
      // Effacer l'erreur du champ modifié
      const errorKey = `billing.${field}`;
      if (fieldErrors[errorKey]) {
        setFieldErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[errorKey];
          return newErrors;
        });
      }
      // Effacer l'erreur générale si présente
      if (error) {
        setError(null);
      }
    },
    [updateBillingField, fieldErrors, error]
  );

  const handleUseSameBillingAddressChange = useCallback(
    (checked: boolean) => {
      setUseSameBillingAddress(checked);
    },
    [setUseSameBillingAddress]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      setIsLoading(true);
      setError(null);
      setFieldErrors({});

      const validation = await validateAddresses();

      if (!validation.isValid) {
        setIsLoading(false);

        // Si on a des erreurs par champ, les afficher
        if ((validation as any).fieldErrors) {
          setFieldErrors((validation as any).fieldErrors);
        } else {
          // Sinon afficher l'erreur générale
          setError(validation.error || "Erreur de validation des adresses");
        }
        return;
      }

      // Sauvegarder les données avant de naviguer vers l'étape suivante
      try {
        await saveCheckoutData();
      } catch (error) {
        logger.error("Erreur lors de la sauvegarde", error);
        setError("Erreur lors de la sauvegarde des données");
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
      // Rediriger vers la page de récapitulatif si la validation réussit
      router.push("/checkout/summary");
    },
    [validateAddresses, saveCheckoutData, router]
  );

  const handleBack = useCallback(() => {
    router.push("/checkout/information");
  }, [router]);

  const clearError = useCallback((fieldName?: string) => {
    if (fieldName) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    } else {
      setError(null);
    }
  }, []);

  return {
    addressData,
    isLoading,
    error,
    fieldErrors,
    handleShippingFieldChange,
    handleBillingFieldChange,
    handleUseSameBillingAddressChange,
    handleSubmit,
    handleBack,
    clearError,
  };
}
