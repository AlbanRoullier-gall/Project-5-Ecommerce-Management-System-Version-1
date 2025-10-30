import React from "react";
import { CustomerPublicDTO } from "../../../dto";
import ActionButtons from "./ActionButtons";
import { TableRow, TableCell } from "../../ui/TableLayout";

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
  onManageAddresses,
}) => {
  return (
    <TableRow>
      {/* Client (nom complet) */}
      <TableCell>
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
      </TableCell>

      {/* Email */}
      <TableCell>
        <span style={{ color: "#6b7280", fontSize: "1rem" }}>
          {customer.email}
        </span>
      </TableCell>

      {/* Téléphone */}
      <TableCell className="mobile-hide">
        <span style={{ color: "#6b7280", fontSize: "1rem" }}>
          {customer.phoneNumber || "-"}
        </span>
      </TableCell>

      {/* Actions */}
      <TableCell width="160px">
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <ActionButtons
            customer={customer}
            onEdit={onEdit}
            onDelete={onDelete}
            onManageAddresses={onManageAddresses}
          />
        </div>
      </TableCell>
    </TableRow>
  );
};

export default CustomerTableRow;
