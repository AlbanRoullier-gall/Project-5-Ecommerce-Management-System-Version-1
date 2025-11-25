import React from "react";
import {
  ActionButtonsContainer,
  ActionButton,
} from "../../shared/ActionButton";

/**
 * Props du composant CreditNoteActionButtons
 */
interface CreditNoteActionButtonsProps {
  /** Callback pour voir les détails de l'avoir */
  onView?: () => void;
  /** Callback pour changer le statut */
  onToggleStatus?: () => void;
  /** Callback pour supprimer l'avoir */
  onDelete?: () => void;
  /** Statut actuel */
  status: string;
}

/**
 * Composant des boutons d'action pour un avoir
 * Affiche les boutons : Voir, Toggle statut, Supprimer
 */
const CreditNoteActionButtons: React.FC<CreditNoteActionButtonsProps> = ({
  onView,
  onToggleStatus,
  onDelete,
  status,
}) => {
  const isRefunded = status === "refunded";

  return (
    <ActionButtonsContainer>
      {onView && (
        <ActionButton
          icon="fas fa-eye"
          color="#3b82f6"
          title="Voir"
          onClick={onView}
        />
      )}
      {onToggleStatus && (
        <ActionButton
          icon={isRefunded ? "fas fa-undo" : "fas fa-check"}
          color={isRefunded ? "#f59e0b" : "#10b981"}
          title={
            isRefunded ? "Marquer comme en attente" : "Marquer comme remboursé"
          }
          onClick={onToggleStatus}
        />
      )}
      {onDelete && (
        <ActionButton
          icon="fas fa-trash"
          color="#ef4444"
          title="Supprimer"
          onClick={onDelete}
        />
      )}
    </ActionButtonsContainer>
  );
};

export default CreditNoteActionButtons;
