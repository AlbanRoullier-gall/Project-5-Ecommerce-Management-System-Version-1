import React from "react";
import { CustomerPublicDTO } from "../../../dto";

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
 * Style similaire aux boutons d'action des produits
 */
const ActionButtons: React.FC<ActionButtonsProps> = ({
  customer,
  onEdit,
  onDelete,
  onManageAddresses,
}) => {
  return (
    <div style={{ display: "flex", gap: "0.75rem" }}>
      {/* Bouton Gérer adresses */}
      <button
        onClick={() => onManageAddresses(customer)}
        title="Gérer les adresses"
        style={{
          padding: "0.75rem",
          border: "none",
          background: "none",
          cursor: "pointer",
          color: "#d9b970",
          transition: "all 0.2s ease",
          borderRadius: "8px",
          fontSize: "1.2rem",
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.background = "rgba(217, 185, 112, 0.1)";
          e.currentTarget.style.transform = "scale(1.1)";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = "none";
          e.currentTarget.style.transform = "scale(1)";
        }}
      >
        <i className="fas fa-map-marker-alt"></i>
      </button>

      {/* Bouton Modifier */}
      <button
        onClick={() => onEdit(customer)}
        title="Modifier"
        style={{
          padding: "0.75rem",
          border: "none",
          background: "none",
          cursor: "pointer",
          color: "#3b82f6",
          transition: "all 0.2s ease",
          borderRadius: "8px",
          fontSize: "1.2rem",
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.background = "rgba(59, 130, 246, 0.1)";
          e.currentTarget.style.transform = "scale(1.1)";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = "none";
          e.currentTarget.style.transform = "scale(1)";
        }}
      >
        <i className="fas fa-edit"></i>
      </button>

      {/* Bouton Supprimer */}
      <button
        onClick={() => onDelete(customer.customerId)}
        title="Supprimer"
        style={{
          padding: "0.75rem",
          border: "none",
          background: "none",
          cursor: "pointer",
          color: "#ef4444",
          transition: "all 0.2s ease",
          borderRadius: "8px",
          fontSize: "1.2rem",
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)";
          e.currentTarget.style.transform = "scale(1.1)";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = "none";
          e.currentTarget.style.transform = "scale(1)";
        }}
      >
        <i className="fas fa-trash"></i>
      </button>
    </div>
  );
};

export default ActionButtons;
