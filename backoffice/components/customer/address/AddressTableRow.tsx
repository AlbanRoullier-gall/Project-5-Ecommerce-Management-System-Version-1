import React from "react";
import { AddressPublicDTO, CountryDTO } from "../../../dto";

/**
 * Props du composant AddressTableRow
 */
interface AddressTableRowProps {
  /** Adresse à afficher */
  address: AddressPublicDTO;
  /** Liste des pays pour afficher le nom */
  countries: CountryDTO[];
  /** Callback pour éditer l'adresse */
  onEdit: (address: AddressPublicDTO) => void;
  /** Callback pour supprimer l'adresse */
  onDelete: (addressId: number) => void;
}

/**
 * Composant ligne de tableau pour une adresse
 */
const AddressTableRow: React.FC<AddressTableRowProps> = ({
  address,
  countries,
  onEdit,
  onDelete,
}) => {
  const getCountryName = (countryId: number): string => {
    const country = countries.find((c) => c.countryId === countryId);
    return country ? country.countryName : `Pays ID: ${countryId}`;
  };

  const getAddressTypeLabel = (type: string): string => {
    return type === "shipping" ? "Livraison" : "Facturation";
  };

  const buttonBaseStyle: React.CSSProperties = {
    padding: "0.5rem 1rem",
    border: "none",
    borderRadius: "8px",
    fontSize: "0.9rem",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s ease",
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
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
      {/* Type */}
      <td style={{ padding: "1rem 1rem" }}>
        <span
          style={{
            padding: "0.25rem 0.75rem",
            borderRadius: "6px",
            fontSize: "0.9rem",
            fontWeight: "500",
            background:
              address.addressType === "shipping"
                ? "linear-gradient(135deg, #10b981 0%, #34d399 100%)"
                : "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
            color: "white",
          }}
        >
          {getAddressTypeLabel(address.addressType)}
        </span>
      </td>

      {/* Adresse */}
      <td style={{ padding: "1rem 1rem" }}>
        <span style={{ color: "#1f2937", fontSize: "0.95rem" }}>
          {address.address}
        </span>
      </td>

      {/* Code postal */}
      <td style={{ padding: "1rem 1rem" }}>
        <span style={{ color: "#6b7280", fontSize: "0.95rem" }}>
          {address.postalCode}
        </span>
      </td>

      {/* Ville */}
      <td style={{ padding: "1rem 1rem" }}>
        <span style={{ color: "#6b7280", fontSize: "0.95rem" }}>
          {address.city}
        </span>
      </td>

      {/* Pays */}
      <td style={{ padding: "1rem 1rem" }}>
        <span style={{ color: "#6b7280", fontSize: "0.95rem" }}>
          {getCountryName(address.countryId)}
        </span>
      </td>

      {/* Par défaut */}
      <td style={{ padding: "1rem 1rem" }}>
        {address.isDefault ? (
          <i
            className="fas fa-check-circle"
            style={{ color: "#10b981", fontSize: "1.2rem" }}
          ></i>
        ) : (
          <i
            className="fas fa-times-circle"
            style={{ color: "#d1d5db", fontSize: "1.2rem" }}
          ></i>
        )}
      </td>

      {/* Actions */}
      <td style={{ padding: "1rem 1rem" }}>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {/* Bouton Éditer */}
          <button
            onClick={() => onEdit(address)}
            style={{
              ...buttonBaseStyle,
              background: "linear-gradient(135deg, #13686a 0%, #0dd3d1 100%)",
              color: "white",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow =
                "0 4px 12px rgba(19, 104, 106, 0.3)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <i className="fas fa-edit"></i>
            Éditer
          </button>

          {/* Bouton Supprimer */}
          <button
            onClick={() => onDelete(address.addressId)}
            style={{
              ...buttonBaseStyle,
              background: "linear-gradient(135deg, #ef4444 0%, #f87171 100%)",
              color: "white",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow =
                "0 4px 12px rgba(239, 68, 68, 0.3)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <i className="fas fa-trash"></i>
            Supprimer
          </button>
        </div>
      </td>
    </tr>
  );
};

export default AddressTableRow;
