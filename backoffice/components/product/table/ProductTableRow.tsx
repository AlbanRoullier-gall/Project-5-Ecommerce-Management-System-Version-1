import React from "react";
import { ProductPublicDTO } from "../../../dto";
import StatusBadge from "./StatusBadge";
import ActionButtons from "./ActionButtons";

/**
 * Props du composant ProductTableRow
 */
interface ProductTableRowProps {
  /** Produit à afficher */
  product: ProductPublicDTO;
  /** Callback appelé pour éditer le produit */
  onEdit: (product: ProductPublicDTO) => void;
  /** Callback appelé pour supprimer le produit */
  onDelete: (productId: number) => void;
  /** Callback appelé pour changer le statut du produit */
  onToggleStatus: (productId: number, currentStatus: boolean) => void;
  /** Fonction de formatage du prix */
  formatPrice: (price: number) => string;
  /** Fonction de formatage de la date */
  formatDate: (date: Date | string) => string;
}

/**
 * Composant d'une ligne de produit dans le tableau
 * Affiche toutes les informations du produit avec effet hover
 *
 * Colonnes :
 * - Image + nom + description
 * - Catégorie
 * - Prix formaté
 * - Taux TVA
 * - Badge de statut cliquable
 * - Date de création
 * - Boutons d'action
 */
const ProductTableRow: React.FC<ProductTableRowProps> = ({
  product,
  onEdit,
  onDelete,
  onToggleStatus,
  formatPrice,
  formatDate,
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
      <td style={{ padding: "1.5rem 1.25rem" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              flexShrink: 0,
              width: "50px",
              height: "50px",
              background: "#f3f4f6",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            {product.images && product.images.length > 0 ? (
              <img
                src={`http://localhost:3020/${product.images[0].filePath}`}
                alt={product.name}
                style={{
                  width: "50px",
                  height: "50px",
                  objectFit: "cover",
                }}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  const icon =
                    e.currentTarget.parentElement?.querySelector("i");
                  if (icon) {
                    (icon as HTMLElement).style.display = "inline-block";
                  }
                }}
              />
            ) : null}
            <i
              className="fas fa-image"
              style={{
                fontSize: "1.5rem",
                color: "#9ca3af",
                display:
                  product.images && product.images.length > 0
                    ? "none"
                    : "inline-block",
              }}
            ></i>
          </div>
          <div style={{ marginLeft: "1rem" }}>
            <div
              style={{
                fontSize: "1rem",
                fontWeight: "600",
                color: "#111827",
              }}
            >
              {product.name}
            </div>
            {product.description && (
              <div
                style={{
                  fontSize: "0.9rem",
                  color: "#6b7280",
                  maxWidth: "300px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {product.description}
              </div>
            )}
          </div>
        </div>
      </td>
      <td style={{ padding: "1.5rem 1.25rem" }}>
        <span style={{ fontSize: "1rem", color: "#111827" }}>
          {product.categoryName || "-"}
        </span>
      </td>
      <td style={{ padding: "1.5rem 1.25rem" }}>
        <span
          style={{
            fontSize: "1rem",
            fontWeight: "600",
            color: "#13686a",
          }}
        >
          {formatPrice(product.price)}
        </span>
      </td>
      <td style={{ padding: "1.5rem 1.25rem" }}>
        <span style={{ fontSize: "1rem", color: "#111827" }}>
          {product.vatRate}%
        </span>
      </td>
      <td style={{ padding: "1.5rem 1.25rem" }}>
        <StatusBadge
          isActive={product.isActive}
          onClick={() => onToggleStatus(product.id, product.isActive)}
        />
      </td>
      <td
        style={{
          padding: "1.5rem 1.25rem",
          fontSize: "1rem",
          color: "#6b7280",
        }}
      >
        {formatDate(product.createdAt)}
      </td>
      <td style={{ padding: "1.5rem 1.25rem" }}>
        <ActionButtons
          onEdit={() => onEdit(product)}
          onDelete={() => {
            if (
              window.confirm(
                `Êtes-vous sûr de vouloir supprimer le produit "${product.name}" ?`
              )
            ) {
              onDelete(product.id);
            }
          }}
        />
      </td>
    </tr>
  );
};

export default ProductTableRow;
