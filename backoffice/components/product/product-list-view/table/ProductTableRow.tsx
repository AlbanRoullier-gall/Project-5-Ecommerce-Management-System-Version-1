import React from "react";
import { ProductPublicDTO } from "../../../dto";
import StatusBadge from "./StatusBadge";
import ActionButtons from "./ActionButtons";
import { TableRow, TableCell } from "../../../shared/TableLayout";

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
    <TableRow>
      <TableCell>
        <div style={{ display: "flex", alignItems: "center", minWidth: 0 }}>
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
                src={`${
                  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3020"
                }/api/images/${product.images[0].id}`}
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
          <div style={{ marginLeft: "1rem", minWidth: 0, flex: 1 }}>
            <div
              style={{
                fontSize: "1rem",
                fontWeight: "600",
                color: "#111827",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {product.name}
            </div>
            {product.description && (
              <div
                style={{
                  fontSize: "0.875rem",
                  color: "#6b7280",
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
      </TableCell>
      <TableCell>
        <span
          style={{
            fontSize: "1rem",
            color: "#111827",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            display: "block",
          }}
        >
          {product.categoryName || "-"}
        </span>
      </TableCell>
      <TableCell align="right">
        <span
          style={{
            fontSize: "1rem",
            fontWeight: "600",
            color: "#13686a",
          }}
        >
          {formatPrice(product.price)}
        </span>
      </TableCell>
      <TableCell className="mobile-hide" align="center">
        <span style={{ fontSize: "1rem", color: "#111827" }}>
          {product.vatRate}%
        </span>
      </TableCell>
      <TableCell align="center">
        <StatusBadge
          isActive={product.isActive}
          onClick={() => onToggleStatus(product.id, product.isActive)}
        />
      </TableCell>
      <TableCell className="mobile-hide">
        <span style={{ fontSize: "1rem", color: "#6b7280" }}>
          {formatDate(product.createdAt)}
        </span>
      </TableCell>
      <TableCell align="right">
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
      </TableCell>
    </TableRow>
  );
};

export default ProductTableRow;
