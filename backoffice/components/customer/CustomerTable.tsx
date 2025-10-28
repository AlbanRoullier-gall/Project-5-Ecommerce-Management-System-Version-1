import React from "react";
import { CustomerPublicDTO } from "../../dto";
import CustomerTableRow from "./table/CustomerTableRow";

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
  if (customers.length === 0) {
    return (
      <div
        style={{
          background: "white",
          padding: "4rem 2rem",
          borderRadius: "16px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
          textAlign: "center",
          border: "2px solid rgba(19, 104, 106, 0.1)",
        }}
      >
        <i
          className="fas fa-users"
          style={{ fontSize: "4rem", color: "#d1d5db", marginBottom: "1rem" }}
        ></i>
        <p style={{ fontSize: "1.2rem", color: "#6b7280" }}>
          Aucun client trouvé
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        background: "white",
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
        border: "2px solid rgba(19, 104, 106, 0.1)",
      }}
    >
      <div className="table-responsive" style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "separate",
            borderSpacing: 0,
            fontSize: "1rem",
            minWidth: "600px",
          }}
        >
          <thead
            style={{
              background: "linear-gradient(135deg, #13686a 0%, #0dd3d1 100%)",
              color: "white",
            }}
          >
            <tr>
              <th
                style={{
                  padding: "1.5rem 1.25rem",
                  textAlign: "left",
                  fontSize: "1rem",
                  fontWeight: "700",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Client
              </th>
              <th
                style={{
                  padding: "1.5rem 1.25rem",
                  textAlign: "left",
                  fontSize: "1rem",
                  fontWeight: "700",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Email
              </th>
              <th
                className="mobile-hide"
                style={{
                  padding: "1.5rem 1.25rem",
                  textAlign: "left",
                  fontSize: "1rem",
                  fontWeight: "700",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Téléphone
              </th>
              <th
                style={{
                  padding: "1.5rem 1.25rem",
                  textAlign: "left",
                  fontSize: "1rem",
                  fontWeight: "700",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <CustomerTableRow
                key={customer.customerId}
                customer={customer}
                onEdit={onEdit}
                onDelete={onDelete}
                onManageAddresses={onManageAddresses}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CustomerTable;
