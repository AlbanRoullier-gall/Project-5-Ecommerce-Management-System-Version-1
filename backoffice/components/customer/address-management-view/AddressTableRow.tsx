import React from "react";
import { AddressPublicDTO } from "dto";

/**
 * Props du composant AddressTableRow
 */
interface AddressTableRowProps {
  /** Adresse à afficher */
  address: AddressPublicDTO;
  /** Callback appelé pour éditer une adresse */
  onEdit: (address: AddressPublicDTO) => void;
  /** Callback appelé pour supprimer une adresse */
  onDelete: (addressId: number) => void;
}

/**
 * Composant ligne du tableau d'adresses
 */
const AddressTableRow: React.FC<AddressTableRowProps> = ({
  address,
  onEdit,
  onDelete,
}) => {
  const buttonBaseStyle: React.CSSProperties = {
    padding: "0.75rem",
    border: "none",
    borderRadius: "8px",
    fontSize: "1.2rem",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "44px",
    minHeight: "44px",
  };

  return (
    <tr
      style={{
        borderBottom: "1px solid #e5e7eb",
        transition: "background-color 0.2s",
        backgroundColor: "white",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "#f3f4f6";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "white";
      }}
    >
      <td style={{ padding: "1rem 1rem" }}>
        <span style={{ color: "#1f2937", fontSize: "0.95rem" }}>
          {address.address}
        </span>
      </td>
      <td style={{ padding: "0.75rem 1rem", textAlign: "center" }}>
        <span style={{ color: "#6b7280", fontSize: "1rem" }}>
          {address.postalCode}
        </span>
      </td>
      <td style={{ padding: "0.75rem 1rem" }}>
        <span style={{ color: "#6b7280", fontSize: "1rem" }}>
          {address.city}
        </span>
      </td>
      <td className="mobile-hide" style={{ padding: "0.75rem 1rem" }}>
        <span style={{ color: "#6b7280", fontSize: "1rem" }}>
          {address.countryName}
        </span>
      </td>
      <td style={{ padding: "0.75rem 1rem", textAlign: "center" }}>
        {address.isDefault ? (
          <span
            style={{
              padding: "0.25rem 0.75rem",
              borderRadius: "6px",
              fontSize: "0.9rem",
              fontWeight: "500",
              background: "linear-gradient(135deg, #10b981 0%, #34d399 100%)",
              color: "white",
            }}
          >
            Oui
          </span>
        ) : (
          <span
            style={{
              padding: "0.25rem 0.75rem",
              borderRadius: "6px",
              fontSize: "0.9rem",
              fontWeight: "500",
              background: "linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)",
              color: "white",
            }}
          >
            Non
          </span>
        )}
      </td>
      <td style={{ padding: "0.75rem 1rem", textAlign: "center" }}>
        <div
          className="action-buttons"
          style={{
            display: "flex",
            gap: "0.5rem",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <button
            onClick={() => onEdit(address)}
            className="action-btn action-btn-edit"
            title="Éditer"
            style={{
              ...buttonBaseStyle,
              background: "none",
              color: "#3b82f6",
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
          <button
            onClick={() => onDelete(address.addressId)}
            className="action-btn action-btn-delete"
            title="Supprimer"
            style={{
              ...buttonBaseStyle,
              background: "none",
              color: "#ef4444",
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
      </td>
    </tr>
  );
};

export default AddressTableRow;
