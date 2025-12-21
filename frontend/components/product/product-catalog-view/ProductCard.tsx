import React from "react";
import Link from "next/link";
import { ProductPublicDTO } from "../../../dto";
import { PLACEHOLDER_IMAGE_PATH } from "../../shared";
import { useProductCard } from "../../../hooks";
import styles from "../../../styles/components/ProductCard.module.css";

interface ProductCardProps {
  product: ProductPublicDTO;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const {
    quantityInCart,
    isLoading,
    isHovered,
    setIsHovered,
    handleAddToCart,
    handleIncrement,
    handleDecrement,
    getImageUrl,
    canAddToCart,
    canIncrement,
    stockError,
  } = useProductCard(product);

  const priceWithVat = product.priceTTC;

  const cardClass = `${styles.card} ${isHovered ? styles.hover : ""}`;
  const imageClass = `${styles.image} ${isHovered ? styles.imageHover : ""}`;

  return (
    <div
      className={cardClass}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/product?productId=${product.id}`} className={styles.link}>
        <div className={styles.imageWrapper}>
          <img
            src={getImageUrl()}
            alt={product.name}
            className={imageClass}
            onError={(e) => {
              (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE_PATH;
            }}
          />
        </div>

        <div className={styles.content}>
          {product.categoryName && (
            <div className={styles.categoryWrap}>
              <div className={styles.category}>{product.categoryName}</div>
            </div>
          )}
          <h3 className={styles.title}>{product.name}</h3>
          {stockError && (
            <div className={styles.stockAlertOut}>
              <i className="fas fa-exclamation-triangle"></i>
              {stockError}
            </div>
          )}
          <div className={styles.meta}>
            <div className={styles.metaRow}>
              <div className={styles.price}>
                <div className={styles.priceLine}>
                  <span className={styles.priceLabel}>HT</span>
                  <span className={styles.priceValue}>
                    {Number(product.price).toFixed(2)} €
                  </span>
                </div>

                <div className={styles.priceSeparator} />

                <div className={styles.priceTotal}>
                  <span className={styles.priceVat}>TTC (Belgique)</span>
                  <span className={styles.priceTotalValue}>
                    {Number(priceWithVat).toFixed(2)} €
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>

      <div className={styles.footer}>
        {quantityInCart === 0 ? (
          <button
            className={styles.addButton}
            onClick={handleAddToCart}
            disabled={isLoading || !canAddToCart}
          >
            <i className="fas fa-shopping-cart"></i>
            {isLoading ? "Ajout..." : "Ajouter au panier"}
          </button>
        ) : (
          <div className={styles.quantityControls}>
            <button
              className={styles.qtyButton}
              onClick={handleDecrement}
              disabled={isLoading}
            >
              <i className="fas fa-minus"></i>
            </button>

            <div className={styles.qtyDisplay}>
              {quantityInCart} {quantityInCart > 1 ? "articles" : "article"}
            </div>

            <button
              className={styles.qtyButton}
              onClick={handleIncrement}
              disabled={isLoading || !canIncrement}
            >
              <i className="fas fa-plus"></i>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
