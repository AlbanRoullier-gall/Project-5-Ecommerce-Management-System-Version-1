import React from "react";
import { CustomerPublicDTO } from "../../../dto";
import { ActionButtonsContainer, ActionButton } from "../../shared/ActionButton";

/**
 * Props du composant ActionButtons
 */
interface ActionButtonsProps {
  /** Client associé aux actions */
  customer: CustomerPublicDTO;
  /** Callback pour éditer le client */
  onEdit: (customer: CustomerPublicDTO) => void;
  /** Callback pour supprimer le client */
  onDelete: (customerId: number) => void;
  /** Callback pour gérer les adresses */
  onManageAddresses: (customer: CustomerPublicDTO) => void;
}

/**
 * Composant des boutons d'action pour un client
 * Affiche les boutons : Gérer adresses, Éditer, Supprimer
 */
const ActionButtons: React.FC<ActionButtonsProps> = ({
  customer,
  onEdit,
  onDelete,
  onManageAddresses,
}) => {
  return (
    <ActionButtonsContainer>
      <ActionButton
        icon="fas fa-map-marker-alt"
        color="#d9b970"
        title="Gérer les adresses"
        onClick={() => onManageAddresses(customer)}
      />
      <ActionButton
        icon="fas fa-edit"
        color="#3b82f6"
        title="Modifier"
        onClick={() => onEdit(customer)}
      />
      <ActionButton
        icon="fas fa-trash"
        color="#ef4444"
        title="Supprimer"
        onClick={() => onDelete(customer.customerId)}
      />
    </ActionButtonsContainer>
  );
};

export default ActionButtons;
