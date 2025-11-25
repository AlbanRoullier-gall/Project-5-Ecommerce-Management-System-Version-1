import React from "react";
import { CustomerPublicDTO } from "../../dto";
import TableLayout, {
  TableHeader,
  TableRow,
  TableCell,
} from "../shared/TableLayout";
import { ActionButtonsContainer, ActionButton } from "../shared/ActionButton";

/**
 * Props du composant CustomerTable
 */
interface CustomerTableProps {
  /** Liste des clients à afficher */
  customers: CustomerPublicDTO[];
  /** Callback appelé pour éditer un client */
  onEdit: (customer: CustomerPublicDTO) => void;
  /** Callback appelé pour supprimer un client */
  onDelete: (customerId: number) => void;
  /** Callback appelé pour gérer les adresses d'un client */
  onManageAddresses: (customer: CustomerPublicDTO) => void;
}

/**
 * Composant tableau de clients
 * Affiche la liste des clients dans un tableau avec colonnes :
 * - Client (nom complet)
 * - Email
 * - Téléphone
 * - Actions (éditer/supprimer/gérer adresses)
 *
 * Affiche un message si aucun client n'est trouvé
 */
const CustomerTable: React.FC<CustomerTableProps> = ({
  customers,
  onEdit,
  onDelete,
  onManageAddresses,
}) => {
  // Empty state handled below inside TableLayout for consistency

  const headers: TableHeader[] = [
    { label: "Client" },
    { label: "Email" },
    { label: "Téléphone", className: "mobile-hide" },
    { label: "Actions", align: "right", width: "160px" },
  ];

  return (
    <TableLayout headers={headers} minWidth="600px" headerGradient="teal">
      {customers.length === 0 && (
        <TableRow>
          <TableCell
            colSpan={4}
            align="center"
            style={{ color: "#6b7280", padding: "1rem" }}
          >
            Aucun client trouvé
          </TableCell>
        </TableRow>
      )}
      {customers.map((customer) => (
        <CustomerTableRow
          key={customer.customerId}
          customer={customer}
          onEdit={onEdit}
          onDelete={onDelete}
          onManageAddresses={onManageAddresses}
        />
      ))}
    </TableLayout>
  );
};

export default CustomerTable;

interface CustomerTableRowProps {
  customer: CustomerPublicDTO;
  onEdit: (customer: CustomerPublicDTO) => void;
  onDelete: (customerId: number) => void;
  onManageAddresses: (customer: CustomerPublicDTO) => void;
}

const CustomerTableRow: React.FC<CustomerTableRowProps> = ({
  customer,
  onEdit,
  onDelete,
  onManageAddresses,
}) => (
  <TableRow>
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

    <TableCell>
      <span style={{ color: "#6b7280", fontSize: "1rem" }}>
        {customer.email}
      </span>
    </TableCell>

    <TableCell className="mobile-hide">
      <span style={{ color: "#6b7280", fontSize: "1rem" }}>
        {customer.phoneNumber || "-"}
      </span>
    </TableCell>

    <TableCell width="160px">
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <CustomerActionButtons
          customer={customer}
          onEdit={onEdit}
          onDelete={onDelete}
          onManageAddresses={onManageAddresses}
        />
      </div>
    </TableCell>
  </TableRow>
);

interface CustomerActionButtonsProps {
  customer: CustomerPublicDTO;
  onEdit: (customer: CustomerPublicDTO) => void;
  onDelete: (customerId: number) => void;
  onManageAddresses: (customer: CustomerPublicDTO) => void;
}

const CustomerActionButtons: React.FC<CustomerActionButtonsProps> = ({
  customer,
  onEdit,
  onDelete,
  onManageAddresses,
}) => (
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
