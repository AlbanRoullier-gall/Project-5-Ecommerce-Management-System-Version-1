import React, { ReactNode } from "react";
import ErrorAlert from "./ErrorAlert";
import ManagementSectionHeader from "./ManagementSectionHeader";

/**
 * Props du composant ManagementSection
 */
interface ManagementSectionProps {
  /** Titre de la section */
  title: string;
  /** Texte du bouton d'ajout */
  addButtonText?: string;
  /** Callback appelé pour ajouter un nouvel élément */
  onAdd?: () => void;
  /** Callback appelé pour fermer la section */
  onClose?: () => void;
  /** Indique si le formulaire est ouvert */
  isFormOpen?: boolean;
  /** Message d'erreur à afficher */
  error?: string | null;
  /** Callback appelé pour fermer l'erreur */
  onErrorClose?: () => void;
  /** Contenu du formulaire (affiché si isFormOpen est true) */
  formContent?: ReactNode;
  /** Contenu de la liste/tableau (affiché si isFormOpen est false) */
  listContent?: ReactNode;
}

/**
 * Composant de section de gestion réutilisable
 * Encapsule la structure commune pour CategoryManagement et AddressManagement
 */
const ManagementSection: React.FC<ManagementSectionProps> = ({
  title,
  addButtonText,
  onAdd,
  onClose,
  isFormOpen = false,
  error,
  onErrorClose,
  formContent,
  listContent,
}) => {
  return (
    <div
      style={{
        background: "white",
        borderRadius: "16px",
        padding: "2rem",
        marginBottom: "2rem",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
        border: "2px solid rgba(19, 104, 106, 0.1)",
      }}
    >
      {error && onErrorClose && (
        <ErrorAlert message={error} onClose={onErrorClose} />
      )}

      <ManagementSectionHeader
        title={title}
        addButtonText={addButtonText}
        onAdd={onAdd}
        onClose={onClose}
        isFormOpen={isFormOpen}
      />

      {/* Formulaire */}
      {isFormOpen && formContent}

      {/* Liste */}
      {!isFormOpen && listContent}
    </div>
  );
};

export default ManagementSection;

