/**
 * Composant générique pour afficher un item (Cart ou Order)
 * Utilise BaseItemDTO pour garantir la cohérence entre CartItem et OrderItem
 */

import React from "react";
import { BaseItemDTO } from "@tfe/shared-types/common/BaseItemDTO";
import QuantitySelector from "./QuantitySelector";
import { PLACEHOLDER_IMAGE_PATH } from "./constants";

interface ItemDisplayProps {
  item: BaseItemDTO;
  // Options d'affichage
  showImage?: boolean;
  showDescription?: boolean;
  showQuantityControls?: boolean;
  showRemoveButton?: boolean;
  // Callbacks optionnels (pour Cart uniquement)
  onQuantityChange?: (newQuantity: number) => void | Promise<void>;
  onRemove?: () => void | Promise<void>;
  // État optionnel
  isUpdating?: boolean;
  currentQuantity?: number;
}

/**
 * Composant générique pour afficher un item
 * Fonctionne avec CartItemPublicDTO et OrderItemPublicDTO grâce à BaseItemDTO
 */
const ItemDisplay: React.FC<ItemDisplayProps> = ({
  item,
  showImage = true,
  showDescription = false,
  showQuantityControls = false,
  showRemoveButton = false,
  onQuantityChange,
  onRemove,
  isUpdating = false,
  currentQuantity,
}) => {
  const quantity = currentQuantity ?? item.quantity;
  const productImage = item.imageUrl || PLACEHOLDER_IMAGE_PATH;

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1 || !onQuantityChange) return;
    await onQuantityChange(newQuantity);
  };

  const handleRemove = async () => {
    if (!onRemove) return;
    if (!confirm("Voulez-vous vraiment supprimer cet article ?")) {
      return;
    }
    await onRemove();
  };

  return (
    <div
      className="item-display-container"
      style={{
        background: "white",
        borderRadius: "16px",
        padding: "2.4rem",
        marginBottom: "2rem",
        boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
        border: "1px solid #eaeaea",
        minHeight: "180px",
        opacity: isUpdating ? 0.6 : 1,
        transition: "opacity 0.3s ease",
        boxSizing: "border-box",
        width: "100%",
        maxWidth: "100%",
      }}
    >
      <div
        className="item-display-grid"
        style={{
          display: "grid",
          gridTemplateColumns: showImage ? "150px 1fr auto" : "1fr auto",
          gridTemplateRows: "auto auto",
          columnGap: "2.4rem",
          rowGap: "1.6rem",
          alignItems: "center",
          width: "100%",
          maxWidth: "100%",
          boxSizing: "border-box",
        }}
      >
        {/* Image */}
        {showImage && (
          <div
            className="item-display-image"
            style={{
              width: "150px",
              height: "150px",
              borderRadius: "12px",
              overflow: "hidden",
              background: "#ffffff",
              border: "1px solid #eee",
              gridRow: "1 / span 2",
            }}
          >
            <img
              src={productImage}
              alt={item.productName || "Produit"}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                backgroundColor: "#fff",
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE_PATH;
              }}
            />
          </div>
        )}

        {/* Ligne 1: Nom et prix unitaire */}
        <div
          className="item-display-header"
          style={{
            gridColumn: showImage ? "2 / 4" : "1 / 3",
            gridRow: 1,
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1.2rem",
            minWidth: 0,
          }}
        >
          <div
            className="item-display-name"
            style={{
              flex: 1,
              width: "auto",
              minWidth: 0,
            }}
          >
            <h3
              className="item-display-title"
              style={{
                fontSize: "2rem",
                fontWeight: "600",
                margin: 0,
                color: "#333",
                marginBottom:
                  showDescription && item.description ? "0.5rem" : 0,
                wordWrap: "break-word",
                overflowWrap: "break-word",
                hyphens: "auto",
              }}
            >
              {item.productName || "Produit"}
            </h3>
            {showDescription && item.description && (
              <p
                style={{
                  fontSize: "1rem",
                  color: "#666",
                  margin: 0,
                  lineHeight: "1.4",
                  wordWrap: "break-word",
                  overflowWrap: "break-word",
                }}
              >
                {item.description}
              </p>
            )}
          </div>

          {/* Prix unitaire et TVA */}
          <div
            className="item-display-unit-price"
            style={{
              textAlign: "right",
              whiteSpace: "nowrap",
              flexShrink: 0,
              minWidth: 0,
              maxWidth: "100%",
            }}
          >
            <div
              className="item-display-unit-price-value"
              style={{
                fontSize: "1.2rem",
                color: "#333",
                fontWeight: 600,
                wordWrap: "break-word",
                overflowWrap: "break-word",
              }}
            >
              {Number(item.unitPriceHT).toFixed(2)} € HTVA / unité
            </div>
            <div
              className="item-display-vat-info"
              style={{
                fontSize: "1.1rem",
                color: "#7a7a7a",
                marginTop: "0.2rem",
                wordWrap: "break-word",
                overflowWrap: "break-word",
              }}
            >
              TVA (Belgique) {item.vatRate}%
            </div>
          </div>
        </div>

        {/* Ligne 2: Quantité et total */}
        <div
          className="item-display-footer"
          style={{
            gridColumn: showImage ? "2 / 4" : "1 / 3",
            gridRow: 2,
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1.2rem",
            minWidth: 0,
          }}
        >
          {showQuantityControls && onQuantityChange ? (
            <QuantitySelector
              quantity={quantity}
              onChange={handleQuantityChange}
              min={1}
              disabled={isUpdating}
              isLoading={isUpdating}
            />
          ) : (
            <div
              style={{
                fontSize: "1.2rem",
                color: "#666",
              }}
            >
              Quantité: {quantity}
            </div>
          )}

          <div
            className="item-display-total"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: "0.6rem",
              minWidth: 0,
              flexShrink: 1,
              maxWidth: "100%",
            }}
          >
            <div
              className="item-display-total-price"
              style={{
                fontSize: "2.2rem",
                color: "#13686a",
                fontWeight: "700",
                whiteSpace: "nowrap",
                wordWrap: "break-word",
                overflowWrap: "break-word",
              }}
            >
              {Number(item.totalPriceTTC).toFixed(2)} €
            </div>
            <div
              className="item-display-ttc-label"
              style={{
                fontSize: "0.85rem",
                color: "#94a3b8",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginTop: "-0.3rem",
                wordWrap: "break-word",
                overflowWrap: "break-word",
              }}
            >
              TTC (BELGIQUE)
            </div>
            {showRemoveButton && onRemove && (
              <button
                className="item-display-remove-btn"
                onClick={handleRemove}
                disabled={isUpdating}
                style={{
                  padding: "0.6rem 1.2rem",
                  background: "#fff5f5",
                  color: "#c33",
                  border: "2px solid #f5b7b7",
                  borderRadius: "8px",
                  cursor: isUpdating ? "not-allowed" : "pointer",
                  fontSize: "1.1rem",
                  fontWeight: "600",
                  transition: "all 0.2s ease",
                }}
                onMouseOver={(e) => {
                  if (!isUpdating) {
                    e.currentTarget.style.background = "#c33";
                    e.currentTarget.style.color = "white";
                    e.currentTarget.style.borderColor = "#c33";
                  }
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = "#fff5f5";
                  e.currentTarget.style.color = "#c33";
                  e.currentTarget.style.borderColor = "#f5b7b7";
                }}
                title="Supprimer"
              >
                <i className="fas fa-trash"></i> Retirer
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Styles CSS pour le responsive design */}
      <style jsx>{`
        /* Responsive Design pour ItemDisplay */

        /* Tablette */
        @media (max-width: 1024px) {
          .item-display-container {
            padding: 2rem !important;
            box-sizing: border-box !important;
            width: 100% !important;
            max-width: 100% !important;
          }

          .item-display-grid {
            width: 100% !important;
            box-sizing: border-box !important;
            grid-template-columns: 1fr !important;
            gap: 1.5rem !important;
          }

          .item-display-image {
            grid-column: 1 !important;
            grid-row: 1 !important;
            width: 100% !important;
            max-width: 200px !important;
            height: 200px !important;
            margin: 0 auto !important;
          }

          .item-display-header {
            grid-column: 1 !important;
            grid-row: 2 !important;
          }

          .item-display-footer {
            grid-column: 1 !important;
            grid-row: 3 !important;
          }

          .item-display-title {
            font-size: 1.8rem !important;
            word-wrap: break-word !important;
            overflow-wrap: break-word !important;
          }

          .item-display-total-price {
            font-size: 2rem !important;
            word-wrap: break-word !important;
            overflow-wrap: break-word !important;
          }
        }

        /* Mobile */
        @media (max-width: 768px) {
          .item-display-container {
            padding: 1.5rem !important;
            margin-bottom: 1.5rem !important;
            box-sizing: border-box !important;
            width: 100% !important;
            max-width: 100% !important;
          }

          .item-display-grid {
            grid-template-columns: 1fr !important;
            grid-template-rows: auto auto auto !important;
            gap: 1.5rem !important;
            width: 100% !important;
            box-sizing: border-box !important;
          }

          .item-display-image {
            width: 100% !important;
            max-width: 200px !important;
            height: 200px !important;
            margin: 0 auto !important;
            grid-row: 1 !important;
          }

          .item-display-header {
            grid-column: 1 !important;
            grid-row: 2 !important;
            flex-direction: column !important;
            align-items: center !important;
            gap: 1rem !important;
          }

          .item-display-footer {
            grid-column: 1 !important;
            grid-row: 3 !important;
            flex-direction: column !important;
            align-items: center !important;
            gap: 1rem !important;
            border-top: none !important;
            padding-top: 0 !important;
            margin-top: 0 !important;
          }

          .item-display-name {
            width: 100% !important;
            text-align: center !important;
          }

          .item-display-title {
            font-size: 1.6rem !important;
            text-align: center !important;
          }

          .item-display-unit-price {
            width: 100% !important;
            align-items: center !important;
            text-align: center !important;
          }

          .item-display-unit-price-value {
            font-size: 1.1rem !important;
            text-align: center !important;
          }

          .item-display-vat-info {
            font-size: 1rem !important;
            text-align: center !important;
          }

          .item-display-total {
            width: 100% !important;
            align-items: center !important;
            border-top: none !important;
            padding-top: 0 !important;
          }

          .item-display-total-price {
            font-size: 1.8rem !important;
            text-align: center !important;
          }

          .item-display-ttc-label {
            font-size: 0.9rem !important;
            text-align: center !important;
          }

          .item-display-remove-btn {
            width: 100% !important;
            padding: 0.8rem 1.2rem !important;
          }
        }

        /* iPhone */
        @media (max-width: 480px) {
          .item-display-container {
            padding: 1rem !important;
            margin-bottom: 1rem !important;
            border-radius: 12px !important;
            box-sizing: border-box !important;
            width: 100% !important;
            max-width: 100% !important;
          }

          .item-display-grid {
            gap: 1rem !important;
            width: 100% !important;
            box-sizing: border-box !important;
          }

          .item-display-image {
            max-width: 150px !important;
            height: 150px !important;
          }

          .item-display-title {
            font-size: 1.4rem !important;
            line-height: 1.3 !important;
            text-align: center !important;
            word-wrap: break-word !important;
            overflow-wrap: break-word !important;
            hyphens: auto !important;
            max-width: 100% !important;
          }

          .item-display-unit-price {
            align-items: center !important;
            text-align: center !important;
          }

          .item-display-unit-price-value {
            font-size: 1rem !important;
            text-align: center !important;
            word-wrap: break-word !important;
            overflow-wrap: break-word !important;
            max-width: 100% !important;
          }

          .item-display-vat-info {
            font-size: 0.9rem !important;
            text-align: center !important;
            word-wrap: break-word !important;
            overflow-wrap: break-word !important;
            max-width: 100% !important;
          }

          .item-display-total {
            align-items: center !important;
          }

          .item-display-total-price {
            font-size: 1.6rem !important;
            text-align: center !important;
            word-wrap: break-word !important;
            overflow-wrap: break-word !important;
            max-width: 100% !important;
          }

          .item-display-ttc-label {
            font-size: 0.8rem !important;
            text-align: center !important;
            word-wrap: break-word !important;
            overflow-wrap: break-word !important;
            max-width: 100% !important;
          }

          .item-display-remove-btn {
            font-size: 1rem !important;
            padding: 0.7rem 1rem !important;
          }
        }

        /* Très petits écrans */
        @media (max-width: 360px) {
          .item-display-container {
            padding: 0.8rem !important;
            box-sizing: border-box !important;
            width: 100% !important;
            max-width: 100% !important;
          }

          .item-display-grid {
            width: 100% !important;
            box-sizing: border-box !important;
          }

          .item-display-title {
            font-size: 1.2rem !important;
            text-align: center !important;
            word-wrap: break-word !important;
            overflow-wrap: break-word !important;
            hyphens: auto !important;
            max-width: 100% !important;
          }

          .item-display-unit-price {
            align-items: center !important;
            text-align: center !important;
          }

          .item-display-unit-price-value {
            font-size: 0.95rem !important;
            text-align: center !important;
            word-wrap: break-word !important;
            overflow-wrap: break-word !important;
            max-width: 100% !important;
          }

          .item-display-vat-info {
            text-align: center !important;
            word-wrap: break-word !important;
            overflow-wrap: break-word !important;
            max-width: 100% !important;
          }

          .item-display-total {
            align-items: center !important;
          }

          .item-display-total-price {
            font-size: 1.4rem !important;
            text-align: center !important;
            word-wrap: break-word !important;
            overflow-wrap: break-word !important;
            max-width: 100% !important;
          }

          .item-display-ttc-label {
            text-align: center !important;
            word-wrap: break-word !important;
            overflow-wrap: break-word !important;
            max-width: 100% !important;
          }

          .item-display-remove-btn {
            font-size: 0.95rem !important;
            padding: 0.6rem 0.8rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ItemDisplay;
