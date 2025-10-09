import React from "react";

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
    <div
      style={{
        display: "flex",
        justifyContent: "flex-end",
        gap: "1rem",
        paddingTop: "2rem",
        borderTop: "2px solid #e1e5e9",
      }}
    >
      <button
        type="button"
        onClick={onCancel}
        disabled={isLoading}
        style={{
          padding: "1rem 2rem",
          border: "2px solid #e1e5e9",
          background: "white",
          color: "#6b7280",
          borderRadius: "10px",
          fontSize: "1.1rem",
          fontWeight: "600",
          cursor: isLoading ? "not-allowed" : "pointer",
          transition: "all 0.3s ease",
          opacity: isLoading ? 0.5 : 1,
        }}
        onMouseOver={(e) => {
          if (!isLoading) {
            e.currentTarget.style.borderColor = "#13686a";
            e.currentTarget.style.color = "#13686a";
            e.currentTarget.style.background = "#f8f9fa";
          }
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.borderColor = "#e1e5e9";
          e.currentTarget.style.color = "#6b7280";
          e.currentTarget.style.background = "white";
        }}
      >
        {cancelLabel}
      </button>
      <button
        type="submit"
        disabled={isLoading}
        onClick={onSubmit}
        style={{
          padding: "1rem 2rem",
          background: "linear-gradient(135deg, #13686a 0%, #0dd3d1 100%)",
          color: "white",
          border: "none",
          borderRadius: "10px",
          fontSize: "1.1rem",
          fontWeight: "600",
          cursor: isLoading ? "not-allowed" : "pointer",
          transition: "all 0.3s ease",
          boxShadow: "0 4px 12px rgba(19, 104, 106, 0.2)",
          opacity: isLoading ? 0.7 : 1,
        }}
        onMouseOver={(e) => {
          if (!isLoading) {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow =
              "0 8px 24px rgba(19, 104, 106, 0.35)";
          }
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow =
            "0 4px 12px rgba(19, 104, 106, 0.2)";
        }}
      >
        {defaultSubmitLabel}
      </button>
    </div>
  );
};

export default FormActions;
