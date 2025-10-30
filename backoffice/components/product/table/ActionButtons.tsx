import React from "react";
import { ActionButtonsContainer, ActionButton } from "../../ui/ActionButton";

/**
 * Props du composant ActionButtons
 */
interface ActionButtonsProps {
  /** Callback appelé lors du clic sur le bouton Modifier */
  onEdit: () => void;
  /** Callback appelé lors du clic sur le bouton Supprimer */
  onDelete: () => void;
}

/**
 * Composant des boutons d'action pour une ligne de tableau
 * Affiche les boutons Modifier (bleu) et Supprimer (rouge) avec effet hover
 *
 * @example
 * <ActionButtons
 *   onEdit={() => handleEdit(product)}
 *   onDelete={() => handleDelete(product.id)}
 * />
 */
const ActionButtons: React.FC<ActionButtonsProps> = ({ onEdit, onDelete }) => {
  return (
    <ActionButtonsContainer>
      <ActionButton
        icon="fas fa-edit"
        color="#3b82f6"
        title="Modifier"
        onClick={onEdit}
      />
      <ActionButton
        icon="fas fa-trash"
        color="#ef4444"
        title="Supprimer"
        onClick={onDelete}
      />
    </ActionButtonsContainer>
  );
};

export default ActionButtons;
