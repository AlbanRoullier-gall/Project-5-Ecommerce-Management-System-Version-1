import React from "react";
import Button from "./Button";

/**
 * Props du composant ManagementSectionHeader
 */
interface ManagementSectionHeaderProps {
  /** Titre de la section */
  title: string;
  /** Texte du bouton d'ajout */
  addButtonText?: string;
  /** Callback appelé pour ajouter un nouvel élément */
  onAdd?: () => void;
  /** Callback appelé pour fermer la section */
  onClose?: () => void;
  /** Indique si le formulaire est ouvert (pour masquer le bouton d'ajout) */
  isFormOpen?: boolean;
}

/**
 * Composant d'en-tête réutilisable pour les sections de gestion
 * Utilisé par CategoryManagement et AddressManagement pour harmoniser l'affichage
 */
const ManagementSectionHeader: React.FC<ManagementSectionHeaderProps> = ({
  title,
  addButtonText,
  onAdd,
  onClose,
  isFormOpen = false,
}) => {
  return (
    <div
      className="management-section-header"
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "2rem",
        paddingBottom: "1rem",
        borderBottom: "3px solid #d9b970",
        flexWrap: "wrap",
        gap: "1rem",
      }}
    >
      <h2
        style={{
          fontSize: "2rem",
          fontWeight: "bold",
          color: "#13686a",
          margin: 0,
          flex: "0 0 auto",
        }}
      >
        {title}
      </h2>
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          alignItems: "center",
          flex: "0 0 auto",
          marginLeft: "auto",
        }}
      >
        {!isFormOpen && addButtonText && onAdd && (
          <Button onClick={onAdd} variant="primary" icon="fas fa-plus">
            {addButtonText}
          </Button>
        )}
        {onClose && (
          <Button onClick={onClose} variant="gold" icon="fas fa-times">
            Fermer
          </Button>
        )}
      </div>
    </div>
  );
};

export default ManagementSectionHeader;

