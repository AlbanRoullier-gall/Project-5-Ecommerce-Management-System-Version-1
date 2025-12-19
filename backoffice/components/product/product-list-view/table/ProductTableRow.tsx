import React from "react";
import { ProductPublicDTO } from "dto";
import StatusBadge from "./StatusBadge";
import ActionButtons from "./ActionButtons";
import { TableRow, TableCell } from "../../../shared/TableLayout";
import { imageService } from "../../../../services/imageService";
import styles from "../../../../styles/components/ProductTableRow.module.css";

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
  formatDate,
}) => {
  return (
    <TableRow>
      <TableCell>
        <div className={styles.rowContent}>
          <div className={styles.thumb}>
            {product.images && product.images.length > 0 ? (
              <img
                src={imageService.getImageUrlById(product.images[0].id)}
                alt={product.name}
                className={styles.thumbImage}
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
            {(!product.images || product.images.length === 0) && (
              <i className={`fas fa-image ${styles.thumbIcon}`}></i>
            )}
          </div>
          <div className={styles.info}>
            <div className={styles.name}>
              {product.name}
              {product.stock === 0 && (
                <span className={styles.stockAlert} title="Rupture de stock">
                  ⚠️ Rupture de stock
                </span>
              )}
            </div>
            {product.description && (
              <div className={styles.desc}>{product.description}</div>
            )}
          </div>
        </div>
      </TableCell>
      <TableCell>
        <span className={styles.category}>{product.categoryName || "-"}</span>
      </TableCell>
      <TableCell align="right">
        <span className={styles.price}>
          {Number(product.price).toFixed(2)} €
        </span>
      </TableCell>
      <TableCell className="mobile-hide" align="center">
        <span className={styles.vat}>{product.vatRate}%</span>
      </TableCell>
      <TableCell align="center">
        <span
          className={`${styles.stock} ${
            product.stock === 0 ? styles.stockZero : ""
          }`}
        >
          {product.stock ?? 0}
        </span>
      </TableCell>
      <TableCell align="center">
        <StatusBadge
          isActive={product.isActive}
          onClick={() => onToggleStatus(product.id, product.isActive)}
        />
      </TableCell>
      <TableCell className="mobile-hide">
        <span className={styles.createdAt}>
          {formatDate(product.createdAt)}
        </span>
      </TableCell>
      <TableCell align="right" width="160px">
        <div className={styles.actions}>
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
        </div>
      </TableCell>
    </TableRow>
  );
};

export default ProductTableRow;
