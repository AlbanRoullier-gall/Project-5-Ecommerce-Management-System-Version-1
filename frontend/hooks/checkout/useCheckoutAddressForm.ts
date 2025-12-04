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
  handleShippingFieldChange: (field: string, value: string) => void;
  handleBillingFieldChange: (field: string, value: string) => void;
  handleUseSameBillingAddressChange: (checked: boolean) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleBack: () => void;
  clearError: () => void;
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

  const handleShippingFieldChange = useCallback(
    (field: string, value: string) => {
      updateShippingField(field, value);
    },
    [updateShippingField]
  );

  const handleBillingFieldChange = useCallback(
    (field: string, value: string) => {
      updateBillingField(field, value);
    },
    [updateBillingField]
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

      const validation = await validateAddresses();

      if (!validation.isValid) {
        setIsLoading(false);
        setError(validation.error || "Erreur de validation des adresses");
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

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    addressData,
    isLoading,
    error,
    handleShippingFieldChange,
    handleBillingFieldChange,
    handleUseSameBillingAddressChange,
    handleSubmit,
    handleBack,
    clearError,
  };
}

