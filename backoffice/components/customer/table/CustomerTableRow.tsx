import React from "react";
import { CustomerPublicDTO } from "../../../dto";
import StatusBadge from "../../product/table/StatusBadge";
import ActionButtons from "./ActionButtons";

/**
 * Props du composant CustomerTableRow
 */
interface CustomerTableRowProps {
  /** Client à afficher */
  customer: CustomerPublicDTO;
  /** Callback pour éditer le client */
  onEdit: (customer: CustomerPublicDTO) => void;
  /** Callback pour supprimer le client */
  onDelete: (customerId: number) => void;
  /** Callback pour changer le statut */
  onToggleStatus: (customerId: number, currentStatus: boolean) => void;
  /** Callback pour gérer les adresses */
  onManageAddresses: (customer: CustomerPublicDTO) => void;
}

/**
 * Composant ligne de tableau pour un client
 * Affiche les informations d'un client et les boutons d'action
 */
const CustomerTableRow: React.FC<CustomerTableRowProps> = ({
  customer,
  onEdit,
  onDelete,
  onToggleStatus,
  onManageAddresses,
}) => {
  return (
    <tr
      style={{
        borderBottom: "1px solid #e1e5e9",
        transition: "all 0.2s ease",
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.background =
          "linear-gradient(90deg, rgba(19, 104, 106, 0.05) 0%, rgba(13, 211, 209, 0.05) 100%)";
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.background = "white";
      }}
    >
      {/* Client (nom complet) */}
      <td style={{ padding: "1.5rem 1.25rem" }}>
        <div>
          <div
            style={{
              fontWeight: "600",
              fontSize: "1rem",
              color: "#111827",
            }}
          >
            {customer.fullName}
          </div>
        </div>
      </td>

      {/* Email */}
      <td style={{ padding: "1.5rem 1.25rem" }}>
        <span style={{ color: "#6b7280", fontSize: "1rem" }}>
          {customer.email}
        </span>
      </td>

      {/* Téléphone */}
      <td style={{ padding: "1.5rem 1.25rem" }}>
        <span style={{ color: "#6b7280", fontSize: "1rem" }}>
          {customer.phoneNumber || "-"}
        </span>
      </td>

      {/* Statut */}
      <td style={{ padding: "1.5rem 1.25rem" }}>
        <StatusBadge
          isActive={customer.isActive}
          onClick={() => onToggleStatus(customer.customerId, customer.isActive)}
        />
      </td>

      {/* Actions */}
      <td style={{ padding: "1.5rem 1.25rem" }}>
        <ActionButtons
          customer={customer}
          onEdit={onEdit}
          onDelete={onDelete}
          onManageAddresses={onManageAddresses}
        />
      </td>
    </tr>
  );
};

export default CustomerTableRow;
