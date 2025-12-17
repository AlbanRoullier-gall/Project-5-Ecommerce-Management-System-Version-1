import React from "react";
import Button from "./Button";
import styles from "../../styles/components/ManagementSectionHeader.module.css";

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
    <div className={styles.header}>
      <h2 className={styles.title}>{title}</h2>
      <div className={styles.actions}>
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
