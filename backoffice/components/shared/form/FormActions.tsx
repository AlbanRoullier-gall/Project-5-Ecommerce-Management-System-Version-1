import React from "react";
import styles from "../../../styles/components/FormActions.module.css";

/**
 * Props du composant FormActions
 */
interface FormActionsProps {
  /** Callback appelé lors de l'annulation */
  onCancel: () => void;
  /** Callback appelé lors de la soumission (optionnel) */
  onSubmit?: () => void;
  /** Texte personnalisé du bouton de soumission */
  submitLabel?: string;
  /** Texte personnalisé du bouton d'annulation */
  cancelLabel?: string;
  /** Indique si une action est en cours */
  isLoading?: boolean;
  /** Indique si on est en mode édition (pour le label par défaut) */
  isEdit?: boolean;
}

/**
 * Composant des boutons d'action de formulaire (Annuler / Soumettre)
 * Gère automatiquement les états de chargement et adapte le texte selon le mode
 *
 * @example
 * <FormActions
 *   onCancel={handleCancel}
 *   isLoading={isLoading}
 *   isEdit={!!product}
 * />
 */
const FormActions: React.FC<FormActionsProps> = ({
  onCancel,
  onSubmit,
  submitLabel,
  cancelLabel = "Annuler",
  isLoading = false,
  isEdit = false,
}) => {
  const defaultSubmitLabel = isLoading
    ? "⏳ En cours..."
    : isEdit
    ? "💾 Mettre à jour"
    : submitLabel || "➕ Créer";

  return (
    <div className={styles.actions}>
      <button
        type="button"
        onClick={onCancel}
        disabled={isLoading}
        className={styles.cancel}
      >
        {cancelLabel}
      </button>
      <button
        type="submit"
        disabled={isLoading}
        onClick={onSubmit}
        className={styles.submit}
      >
        {defaultSubmitLabel}
      </button>
    </div>
  );
};

export default FormActions;
