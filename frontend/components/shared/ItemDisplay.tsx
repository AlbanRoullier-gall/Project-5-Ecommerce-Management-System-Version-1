import React from "react";
import { BaseItemDTO } from "@tfe/shared-types/common/BaseItemDTO";
import QuantitySelector from "./QuantitySelector";
import { PLACEHOLDER_IMAGE_PATH } from "./constants";
import styles from "../../styles/components/ItemDisplay.module.css";

interface ItemDisplayProps {
  item: BaseItemDTO;
  showImage?: boolean;
  showDescription?: boolean;
  showQuantityControls?: boolean;
  showRemoveButton?: boolean;
  onQuantityChange?: (newQuantity: number) => void | Promise<void>;
  onRemove?: () => void | Promise<void>;
  isUpdating?: boolean;
  currentQuantity?: number;
}

/**
 * Composant générique pour afficher un item (panier ou commande)
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
    if (!confirm("Voulez-vous vraiment supprimer cet article ?")) return;
    await onRemove();
  };

  const gridClass = showImage ? styles.withImage : styles.withoutImage;
  const headerClass = showImage ? styles.headerWithImage : styles.headerNoImage;
  const footerClass = showImage ? styles.footerWithImage : styles.footerNoImage;

  return (
    <div className={`${styles.container} ${isUpdating ? styles.updating : ""}`}>
      <div className={`${styles.grid} ${gridClass}`}>
        {showImage && (
          <div className={styles.image}>
            <img
              src={productImage}
              alt={item.productName || "Produit"}
              className={styles.imageTag}
              onError={(e) => {
                (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE_PATH;
              }}
            />
          </div>
        )}

        <div className={`${styles.header} ${headerClass}`}>
          <div className={styles.name}>
            <h3
              className={`${styles.title} ${
                showDescription && item.description
                  ? styles.titleWithDescription
                  : ""
              }`}
            >
              {item.productName || "Produit"}
            </h3>
            {showDescription && item.description && (
              <p className={styles.description}>{item.description}</p>
            )}
          </div>

          <div className={styles.unitPrice}>
            <div className={styles.unitPriceValue}>
              {Number(item.unitPriceHT).toFixed(2)} € HTVA / unité
            </div>
            <div className={styles.vatInfo}>TVA (Belgique) {item.vatRate}%</div>
          </div>
        </div>

        <div className={`${styles.footer} ${footerClass}`}>
          {showQuantityControls && onQuantityChange ? (
            <QuantitySelector
              quantity={quantity}
              onChange={handleQuantityChange}
              min={1}
              disabled={isUpdating}
              isLoading={isUpdating}
            />
          ) : (
            <div className={styles.quantityLabel}>
              Quantité :<span className={styles.quantityValue}>{quantity}</span>
            </div>
          )}

          <div className={styles.totalSection}>
            <div className={styles.totalHT}>
              {Number(item.totalPriceHT).toFixed(2)} € HT
            </div>
            <div className={styles.totalTTC}>
              {Number(item.totalPriceTTC).toFixed(2)} € TTC
            </div>
            {showRemoveButton && onRemove && (
              <button
                className={styles.removeButton}
                onClick={handleRemove}
                disabled={isUpdating}
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
