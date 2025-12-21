/**
 * Composant tableau pour afficher des items (Order, Cart, etc.)
 * Utilise BaseItemDTO pour garantir la cohérence
 * Variante tableau pour le backoffice
 */

import React from "react";
import { BaseItemDTO } from "@tfe/shared-types/common/BaseItemDTO";
import TableLayout, { TableHeader, TableRow, TableCell } from "./TableLayout";
import tableStyles from "../../styles/components/TableLayout.module.css";
import styles from "../../styles/components/ItemDisplayTable.module.css";

interface ItemDisplayTableProps {
  items: BaseItemDTO[];
  // Options d'affichage
  showImage?: boolean;
  showDescription?: boolean;
  // Colonnes personnalisées
  columns?: {
    product?: boolean;
    quantity?: boolean;
    unitPriceHT?: boolean;
    vatRate?: boolean;
    totalPriceHT?: boolean;
    totalPriceTTC?: boolean;
    selection?: boolean; // Pour les checkboxes (credit-note)
  };
  // Style personnalisé
  variant?: "order" | "cart" | "credit-note";
  // Callbacks pour la sélection (si selection est activé)
  selectedItemIds?: (string | number)[];
  onSelectionChange?: (itemId: string | number, checked: boolean) => void;
  // Fonction pour extraire l'ID d'un item (pour compatibilité avec différents types)
  getItemId?: (item: BaseItemDTO) => string | number;
}

/**
 * Composant tableau générique pour afficher des items
 * Fonctionne avec CartItemPublicDTO et OrderItemPublicDTO grâce à BaseItemDTO
 */
const ItemDisplayTable: React.FC<ItemDisplayTableProps> = ({
  items,
  showImage = false,
  showDescription = false,
  columns = {
    product: true,
    quantity: true,
    unitPriceHT: true,
    vatRate: true,
    totalPriceHT: true,
    totalPriceTTC: true,
    selection: false,
  },
  variant = "order",
  selectedItemIds = [],
  onSelectionChange,
  getItemId,
}) => {
  if (items.length === 0) {
    return <div className={styles.emptyState}>Aucun article</div>;
  }

  const headers: TableHeader[] = [];

  if (columns.selection) {
    headers.push({ label: "Sélection", align: "center", width: "90px" });
  }
  if (columns.product) {
    headers.push({ label: "Produit", align: "left" });
  }
  if (columns.quantity) {
    headers.push({ label: "Qté", align: "center", width: "90px" });
  }
  if (columns.unitPriceHT) {
    headers.push({
      label: "Prix unit. HT",
      align: "right",
      className: tableStyles.mobileHide,
    });
  }
  if (columns.vatRate) {
    headers.push({
      label: "TVA",
      align: "right",
      className: tableStyles.mobileHide,
    });
  }
  if (columns.totalPriceHT) {
    headers.push({ label: "Total HT", align: "right" });
  }
  if (columns.totalPriceTTC) {
    headers.push({ label: "Total TTC", align: "right" });
  }

  return (
    <TableLayout
      headers={headers}
      headerGradient={variant === "credit-note" ? "gold" : "teal"}
    >
      {items.map((item, index) => {
        const itemId = getItemId ? getItemId(item) : (item as any).id;
        const isSelected =
          itemId !== undefined && selectedItemIds.includes(itemId);

        return (
          <TableRow
            key={itemId || index}
            backgroundColor={index % 2 === 0 ? "white" : "#f9fafb"}
          >
            {columns.selection && itemId !== undefined && (
              <TableCell
                align="center"
                width="90px"
                className={styles.checkboxCell}
              >
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={isSelected}
                  onChange={(e) => {
                    if (onSelectionChange) {
                      onSelectionChange(itemId, e.target.checked);
                    }
                  }}
                />
              </TableCell>
            )}

            {columns.product && (
              <TableCell align="left">
                <div>
                  <div className={styles.productName}>
                    {item.productName || "Produit"}
                  </div>
                  {showDescription && item.description && (
                    <div className={styles.productDescription}>
                      {item.description}
                    </div>
                  )}
                  {showImage && item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.productName}
                      className={styles.productImage}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  )}
                </div>
              </TableCell>
            )}

            {columns.quantity && (
              <TableCell align="center">{item.quantity}</TableCell>
            )}

            {columns.unitPriceHT && (
              <TableCell align="right" className={tableStyles.mobileHide}>
                {Number(item.unitPriceHT).toFixed(2)} €
              </TableCell>
            )}

            {columns.vatRate && (
              <TableCell align="right" className={tableStyles.mobileHide}>
                {item.vatRate}%
              </TableCell>
            )}

            {columns.totalPriceHT && (
              <TableCell align="right" dataLabel="Total HT">
                {Number(item.totalPriceHT).toFixed(2)} €
              </TableCell>
            )}

            {columns.totalPriceTTC && (
              <TableCell
                align="right"
                className={styles.currencyStrong}
                dataLabel="Total TTC"
              >
                {Number(item.totalPriceTTC).toFixed(2)} €
              </TableCell>
            )}
          </TableRow>
        );
      })}
    </TableLayout>
  );
};

export default ItemDisplayTable;
