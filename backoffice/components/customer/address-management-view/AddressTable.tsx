import React from "react";
import { AddressPublicDTO } from "../../../dto";
import AddressTableRow from "./AddressTableRow";

/**
 * Props du composant AddressTable
 */
interface AddressTableProps {
  /** Liste des adresses à afficher */
  addresses: AddressPublicDTO[];
  /** Callback appelé pour éditer une adresse */
  onEdit: (address: AddressPublicDTO) => void;
  /** Callback appelé pour supprimer une adresse */
  onDelete: (addressId: number) => void;
}

const headerCellStyle: React.CSSProperties = {
  padding: "1.25rem 1.25rem",
  textAlign: "left",
  fontSize: "1rem",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

/**
 * Composant tableau des adresses
 */
const AddressTable: React.FC<AddressTableProps> = ({
  addresses,
  onEdit,
  onDelete,
}) => {
  if (addresses.length === 0) {
    return (
      <div
        style={{
          background: "#f9fafb",
          padding: "3rem 2rem",
          borderRadius: "12px",
          textAlign: "center",
          border: "1px solid #e5e7eb",
        }}
      >
        <i
          className="fas fa-map-marker-alt"
          style={{ fontSize: "3rem", color: "#d1d5db", marginBottom: "1rem" }}
        ></i>
        <p style={{ fontSize: "1.1rem", color: "#6b7280" }}>
          Aucune adresse enregistrée
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        background: "white",
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
        border: "2px solid rgba(19, 104, 106, 0.1)",
        display: "flex",
        flexDirection: "column",
        maxHeight: "600px",
      }}
    >
      <div
        className="table-responsive"
        style={{
          overflowX: "auto",
          overflowY: "auto",
          flex: 1,
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "separate",
            borderSpacing: 0,
            fontSize: "1rem",
            minWidth: "800px",
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
                  ...headerCellStyle,
                  position: "sticky",
                  top: 0,
                  zIndex: 10,
                  background:
                    "linear-gradient(135deg, #13686a 0%, #0dd3d1 100%)",
                  color: "white",
                }}
              >
                Adresse
              </th>
              <th
                style={{
                  ...headerCellStyle,
                  textAlign: "center",
                  position: "sticky",
                  top: 0,
                  zIndex: 10,
                  background:
                    "linear-gradient(135deg, #13686a 0%, #0dd3d1 100%)",
                  color: "white",
                }}
              >
                Code postal
              </th>
              <th
                style={{
                  ...headerCellStyle,
                  position: "sticky",
                  top: 0,
                  zIndex: 10,
                  background:
                    "linear-gradient(135deg, #13686a 0%, #0dd3d1 100%)",
                  color: "white",
                }}
              >
                Ville
              </th>
              <th
                className="mobile-hide"
                style={{
                  ...headerCellStyle,
                  position: "sticky",
                  top: 0,
                  zIndex: 10,
                  background:
                    "linear-gradient(135deg, #13686a 0%, #0dd3d1 100%)",
                  color: "white",
                }}
              >
                Pays
              </th>
              <th
                style={{
                  ...headerCellStyle,
                  textAlign: "center",
                  position: "sticky",
                  top: 0,
                  zIndex: 10,
                  background:
                    "linear-gradient(135deg, #13686a 0%, #0dd3d1 100%)",
                  color: "white",
                }}
              >
                Par défaut
              </th>
              <th
                style={{
                  ...headerCellStyle,
                  textAlign: "center",
                  position: "sticky",
                  top: 0,
                  zIndex: 10,
                  background:
                    "linear-gradient(135deg, #13686a 0%, #0dd3d1 100%)",
                  color: "white",
                }}
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {addresses.map((address) => (
              <AddressTableRow
                key={address.addressId}
                address={address}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AddressTable;
