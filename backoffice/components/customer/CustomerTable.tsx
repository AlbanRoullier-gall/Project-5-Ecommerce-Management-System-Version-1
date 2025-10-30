import React from "react";
import { CustomerPublicDTO } from "../../dto";
import CustomerTableRow from "./table/CustomerTableRow";
import TableLayout, {
  TableHeader,
  TableRow,
  TableCell,
} from "../ui/TableLayout";

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
 * - Client (nom complet + civilité)
 * - Email
 * - Téléphone
 * - Catégorie socio-professionnelle
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
