/**
 * Hook générique pour gérer les formulaires
 * Centralise la logique commune : état, validation, gestion d'erreurs, comparaison pour updates
 */

import { useState, useEffect, useCallback } from "react";
import { computeUpdateData } from "../../utils/formUtils";
import { ValidationResult } from "../../services/validationService";

interface UseFormOptions<TFormData, TOriginal> {
  /** Données originales (pour le mode édition) */
  original?: TOriginal | null;
  /** Valeurs initiales du formulaire */
  initialValues: TFormData;
  /** Fonction de validation */
  validateFn: (data: TFormData) => Promise<ValidationResult>;
  /** Fonction pour transformer les données avant soumission (optionnel) */
  transformData?: (
    data: TFormData,
    original: TOriginal | null
  ) => TFormData | Partial<TFormData>;
  /** Champs à ignorer lors de la comparaison pour les updates */
  ignoreFields?: (keyof TFormData)[];
}

interface UseFormReturn<TFormData> {
  formData: TFormData;
  errors: Record<string, string>;
  handleChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  handleSubmit: (
    onSubmit: (data: TFormData | Partial<TFormData>) => void
  ) => Promise<void>;
  setFormData: (data: TFormData | ((prev: TFormData) => TFormData)) => void;
  resetForm: () => void;
  clearErrors: () => void;
}

/**
 * Hook générique pour gérer les formulaires
 * Gère automatiquement :
 * - L'état du formulaire
 * - La validation
 * - La gestion des erreurs
 * - La comparaison pour les updates (mode édition)
 */
export function useForm<
  TFormData extends Record<string, any>,
  TOriginal = TFormData
>({
  original,
  initialValues,
  validateFn,
  transformData,
  ignoreFields,
}: UseFormOptions<TFormData, TOriginal>): UseFormReturn<TFormData> {
  const [formData, setFormData] = useState<TFormData>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Réinitialiser le formulaire quand original change
  // Note: initialValues est mémorisé dans les hooks qui utilisent useForm
  useEffect(() => {
    if (original) {
      // Mode édition : utiliser les valeurs de original
      setFormData(original as unknown as TFormData);
    } else {
      // Mode création : utiliser les valeurs initiales
      setFormData(initialValues);
    }
    setErrors({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [original]);

  const handleChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      const { name, value, type } = e.target;
      const checked = (e.target as HTMLInputElement).checked;

      setFormData((prev) => ({
        ...prev,
        [name]:
          type === "number"
            ? parseFloat(value) || 0
            : type === "checkbox"
            ? checked
            : value,
      }));

      // Effacer l'erreur du champ modifié
      if (errors[name]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    },
    [errors]
  );

  const validate = useCallback(async (): Promise<boolean> => {
    try {
      const result = await validateFn(formData);

      if (!result.isValid) {
        const newErrors: Record<string, string> = {};

        // Gérer les erreurs de champ spécifiques
        if (result.errors) {
          result.errors.forEach((error) => {
            newErrors[error.field] = error.message;
          });
        }

        // Gérer les erreurs générales
        if (result.error) {
          newErrors._general = result.error;
        }

        setErrors(newErrors);
        return false;
      }

      setErrors({});
      return true;
    } catch (error) {
      console.error("Erreur lors de la validation:", error);
      setErrors({ _general: "Erreur lors de la validation" });
      return false;
    }
  }, [formData, validateFn]);

  const handleSubmit = useCallback(
    async (onSubmit: (data: TFormData | Partial<TFormData>) => void) => {
      const isValid = await validate();
      if (!isValid) {
        return;
      }

      // Transformer les données si nécessaire
      let dataToSubmit: TFormData | Partial<TFormData>;
      if (transformData) {
        dataToSubmit = transformData(formData, original || null);
      } else if (original) {
        // Mode édition : ne retourner que les champs modifiés
        dataToSubmit = computeUpdateData(
          formData,
          original as unknown as TFormData,
          {
            ignoreFields,
          }
        );
      } else {
        // Mode création : retourner toutes les données
        dataToSubmit = formData;
      }

      onSubmit(dataToSubmit);
    },
    [formData, original, validate, transformData, ignoreFields]
  );

  const resetForm = useCallback(() => {
    setFormData(original ? (original as unknown as TFormData) : initialValues);
    setErrors({});
  }, [original, initialValues]);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  return {
    formData,
    errors,
    handleChange,
    handleSubmit,
    setFormData,
    resetForm,
    clearErrors,
  };
}
