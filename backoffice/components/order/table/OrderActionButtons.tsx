import React from "react";
import { ActionButtonsContainer, ActionButton } from "../../ui/ActionButton";

/**
 * Props du composant OrderActionButtons
 */
interface OrderActionButtonsProps {
  /** Callback pour voir les détails de la commande */
  onView?: () => void;
  /** Callback pour changer le statut de livraison */
  onToggleDelivery?: () => void;
  /** Statut de livraison actuel */
  delivered: boolean;
}

/**
 * Composant des boutons d'action pour une commande
 * Affiche les boutons : Voir, Toggle livraison
 */
const OrderActionButtons: React.FC<OrderActionButtonsProps> = ({
  onView,
  onToggleDelivery,
  delivered,
}) => {
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
      {onToggleDelivery && (
        <ActionButton
          icon={delivered ? "fas fa-undo" : "fas fa-check"}
          color={delivered ? "#ef4444" : "#10b981"}
          title={delivered ? "Marquer comme non livré" : "Marquer comme livré"}
          onClick={onToggleDelivery}
        />
      )}
    </ActionButtonsContainer>
  );
};

export default OrderActionButtons;
