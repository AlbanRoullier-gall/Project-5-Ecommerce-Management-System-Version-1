/**
 * Composant tableau pour afficher des items (Order, Cart, etc.)
 * Utilise BaseItemDTO pour garantir la cohérence
 * Variante tableau pour le backoffice
 */

import React from "react";
import { BaseItemDTO } from "@tfe/shared-types/common/BaseItemDTO";

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
    return (
      <div
        style={{
          padding: "0.75rem",
          textAlign: "center",
          color: "#6b7280",
        }}
      >
        Aucun article
      </div>
    );
  }

  return (
    <div className="table-responsive" style={{ overflowX: "auto" }}>
      <table
        style={{
          width: "100%",
          borderCollapse: "separate",
          borderSpacing: 0,
          fontSize: "0.9rem",
          minWidth: "700px",
        }}
      >
        <thead
          style={{
            background:
              variant === "credit-note"
                ? "#f3f4f6"
                : "linear-gradient(135deg, #13686a 0%, #0dd3d1 100%)",
            color: variant === "credit-note" ? "#374151" : "white",
          }}
        >
          <tr>
            {columns.selection && (
              <th
                style={{
                  textAlign: "left",
                  padding: "0.5rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  fontSize: "0.85rem",
                }}
              >
                Sélection
              </th>
            )}
            {columns.product && (
              <th
                style={{
                  textAlign: "left",
                  padding: "0.75rem 1rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  fontSize: "0.85rem",
                }}
              >
                Produit
              </th>
            )}
            {columns.quantity && (
              <th
                style={{
                  textAlign: "center",
                  padding: "0.75rem 1rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  fontSize: "0.85rem",
                }}
              >
                Qté
              </th>
            )}
            {columns.unitPriceHT && (
              <th
                className="mobile-hide"
                style={{
                  textAlign: "right",
                  padding: "0.75rem 1rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  fontSize: "0.85rem",
                }}
              >
                Prix unit. HT
              </th>
            )}
            {columns.vatRate && (
              <th
                className="mobile-hide"
                style={{
                  textAlign: "right",
                  padding: "0.75rem 1rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  fontSize: "0.85rem",
                }}
              >
                TVA
              </th>
            )}
            {columns.totalPriceHT && (
              <th
                style={{
                  textAlign: "right",
                  padding: "1rem 1.25rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Total HT
              </th>
            )}
            {columns.totalPriceTTC && (
              <th
                style={{
                  textAlign: "right",
                  padding: "1rem 1.25rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Total TTC
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => {
            // Pour les items avec id (OrderItemPublicDTO ou CartItemPublicDTO)
            const itemId = getItemId ? getItemId(item) : (item as any).id;
            const isSelected =
              itemId !== undefined && selectedItemIds.includes(itemId);

            return (
              <tr
                key={itemId || index}
                style={{
                  borderTop: "1px solid #f3f4f6",
                  backgroundColor: index % 2 === 0 ? "white" : "#f9fafb",
                }}
              >
                {columns.selection && itemId !== undefined && (
                  <td style={{ padding: "0.5rem" }}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        if (onSelectionChange) {
                          onSelectionChange(itemId, e.target.checked);
                        }
                      }}
                    />
                  </td>
                )}
                {columns.product && (
                  <td
                    style={{
                      padding: "0.5rem 0.75rem",
                      color: "#111827",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: "0.2rem" }}>
                        {item.productName || "Produit"}
                      </div>
                      {showDescription && item.description && (
                        <div
                          style={{
                            fontSize: "0.85rem",
                            color: "#6b7280",
                            marginTop: "0.2rem",
                          }}
                        >
                          {item.description}
                        </div>
                      )}
                      {showImage && item.imageUrl && (
                        <img
                          src={item.imageUrl}
                          alt={item.productName}
                          style={{
                            width: "50px",
                            height: "50px",
                            objectFit: "contain",
                            marginTop: "0.5rem",
                            borderRadius: "4px",
                          }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              "none";
                          }}
                        />
                      )}
                    </div>
                  </td>
                )}
                {columns.quantity && (
                  <td
                    style={{
                      padding: "0.5rem 0.75rem",
                      textAlign: "center",
                    }}
                  >
                    {item.quantity}
                  </td>
                )}
                {columns.unitPriceHT && (
                  <td
                    className="mobile-hide"
                    style={{
                      padding: "0.5rem 0.75rem",
                      textAlign: "right",
                    }}
                  >
                    {Number(item.unitPriceHT).toFixed(2)} €
                  </td>
                )}
                {columns.vatRate && (
                  <td
                    className="mobile-hide"
                    style={{
                      padding: "0.5rem 0.75rem",
                      textAlign: "right",
                    }}
                  >
                    {item.vatRate}%
                  </td>
                )}
                {columns.totalPriceHT && (
                  <td
                    style={{
                      padding: "0.5rem 0.75rem",
                      textAlign: "right",
                      fontWeight: 600,
                    }}
                  >
                    {Number(item.totalPriceHT).toFixed(2)} €
                  </td>
                )}
                {columns.totalPriceTTC && (
                  <td
                    style={{
                      padding: "0.5rem 0.75rem",
                      textAlign: "right",
                      fontWeight: 700,
                      color: "#13686a",
                    }}
                  >
                    {Number(item.totalPriceTTC).toFixed(2)} €
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ItemDisplayTable;
