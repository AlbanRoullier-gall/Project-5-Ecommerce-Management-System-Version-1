/**
 * Hook pour gérer le formulaire de checkout - informations client
 */

import { useState, useCallback } from "react";
import { useRouter } from "next/router";
import { useCheckout } from "../contexts/CheckoutContext";
import { logger } from "../services/logger";

interface UseCheckoutCustomerFormResult {
  customerData: {
    firstName?: string;
    lastName?: string;
    email: string;
    phoneNumber?: string;
  };
  isLoading: boolean;
  errors: { [key: string]: string };
  generalError: string | null;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  clearError: (fieldName?: string) => void;
}

/**
 * Hook pour gérer l'état et la logique du formulaire de checkout - informations client
 */
export function useCheckoutCustomerForm(): UseCheckoutCustomerFormResult {
  const router = useRouter();
  const {
    customerData,
    updateCustomerData,
    validateCustomerData,
    saveCheckoutData,
  } = useCheckout();

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      updateCustomerData({
        ...customerData,
        [name]: value,
      });

      // Effacer l'erreur du champ modifié
      if (errors[name]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }

      // Effacer l'erreur générale si présente
      if (generalError) {
        setGeneralError(null);
      }
    },
    [customerData, updateCustomerData, errors, generalError]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      // Réinitialiser les erreurs
      setErrors({});
      setGeneralError(null);
      setIsLoading(true);

      try {
        // Validation côté serveur
        const validationResult = await validateCustomerData();

        if (!validationResult.isValid) {
          // Afficher les erreurs par champ
          if (validationResult.errors && validationResult.errors.length > 0) {
            const fieldErrors: { [key: string]: string } = {};
            validationResult.errors.forEach((error) => {
              fieldErrors[error.field] = error.message;
            });
            setErrors(fieldErrors);
          }

          // Afficher l'erreur générale si présente
          if (validationResult.generalError) {
            setGeneralError(validationResult.generalError);
          }

          setIsLoading(false);
          return;
        }

        // Sauvegarder les données avant de naviguer vers l'étape suivante
        try {
          await saveCheckoutData();
        } catch (error) {
          logger.error("Erreur lors de la sauvegarde", error);
          setGeneralError("Erreur lors de la sauvegarde des données");
          setIsLoading(false);
          return;
        }

        // Si la validation réussit, rediriger vers la page d'adresse
        router.push("/checkout/address");
      } catch (error) {
        logger.error("Erreur lors de la validation", error);
        setGeneralError("Une erreur est survenue lors de la validation");
        setIsLoading(false);
      }
    },
    [validateCustomerData, saveCheckoutData, router]
  );

  const clearError = useCallback((fieldName?: string) => {
    if (fieldName) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    } else {
      setGeneralError(null);
    }
  }, []);

  return {
    customerData,
    isLoading,
    errors,
    generalError,
    handleChange,
    handleSubmit,
    clearError,
  };
}
