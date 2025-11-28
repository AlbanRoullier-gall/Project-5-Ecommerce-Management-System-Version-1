/**
 * Composant générique pour afficher un item (Cart ou Order)
 * Utilise BaseItemDTO pour garantir la cohérence entre CartItem et OrderItem
 */

import React from "react";
import { BaseItemDTO } from "@tfe/shared-types/common/BaseItemDTO";
import QuantitySelector from "./QuantitySelector";
import { formatPrice } from "./utils/formatPrice";

/**
 * URL de l'API depuis les variables d'environnement
 */
const API_URL = (() => {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (!url) {
    throw new Error(
      "NEXT_PUBLIC_API_URL n'est pas définie. Veuillez configurer cette variable d'environnement."
    );
  }
  return url;
})();

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
  // Style personnalisé
  variant?: "cart" | "order" | "checkout";
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
  variant = "cart",
}) => {
  const quantity = currentQuantity ?? item.quantity;
  const productImage = item.imageUrl || "/images/placeholder.svg";

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
      style={{
        background: "white",
        borderRadius: variant === "checkout" ? "12px" : "16px",
        padding: variant === "checkout" ? "1.2rem" : "2.4rem",
        marginBottom: variant === "checkout" ? "1rem" : "2rem",
        boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
        border: "1px solid #eaeaea",
        minHeight: variant === "checkout" ? "auto" : "180px",
        opacity: isUpdating ? 0.6 : 1,
        transition: "opacity 0.3s ease",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: showImage ? "150px 1fr auto" : "1fr auto",
          gridTemplateRows: "auto auto",
          columnGap: "2.4rem",
          rowGap: "1.6rem",
          alignItems: "center",
        }}
      >
        {/* Image */}
        {showImage && (
          <div
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
                (e.target as HTMLImageElement).src = "/images/placeholder.svg";
              }}
            />
          </div>
        )}

        {/* Ligne 1: Nom et prix unitaire */}
        <div
          style={{
            gridColumn: showImage ? "2 / 4" : "1 / 3",
            gridRow: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1.2rem",
          }}
        >
          <div style={{ flex: 1 }}>
            <h3
              style={{
                fontSize: variant === "checkout" ? "1.3rem" : "2rem",
                fontWeight: "600",
                margin: 0,
                color: "#333",
                marginBottom:
                  showDescription && item.description ? "0.5rem" : 0,
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
                }}
              >
                {item.description}
              </p>
            )}
          </div>
          <div
            style={{
              textAlign: "right",
              whiteSpace: "nowrap",
            }}
          >
            <div
              style={{
                fontSize: variant === "checkout" ? "1rem" : "1.2rem",
                color: "#333",
                fontWeight: 600,
              }}
            >
              {formatPrice(item.unitPriceHT)} HTVA / unité
            </div>
            <div
              style={{
                fontSize: variant === "checkout" ? "0.9rem" : "1.1rem",
                color: "#7a7a7a",
                marginTop: "0.2rem",
              }}
            >
              TVA (Belgique) {item.vatRate}%
            </div>
          </div>
        </div>

        {/* Ligne 2: Quantité et total */}
        <div
          style={{
            gridColumn: showImage ? "2 / 4" : "1 / 3",
            gridRow: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1.2rem",
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
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: "0.6rem",
            }}
          >
            <div
              style={{
                fontSize: variant === "checkout" ? "1.5rem" : "2.2rem",
                color: "#13686a",
                fontWeight: "700",
                whiteSpace: "nowrap",
              }}
            >
              {formatPrice(item.totalPriceTTC)}
            </div>
            <div
              style={{
                fontSize: "0.85rem",
                color: "#94a3b8",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginTop: "-0.3rem",
              }}
            >
              TTC (Belgique)
            </div>
            {showRemoveButton && onRemove && (
              <button
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
    </div>
  );
};

export default ItemDisplay;
