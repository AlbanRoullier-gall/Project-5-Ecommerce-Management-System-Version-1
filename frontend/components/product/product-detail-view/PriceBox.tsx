import React from "react";
import { ProductPublicDTO } from "../../../dto";
import styles from "../../../styles/components/PriceBox.module.css";

interface PriceBoxProps {
  product: ProductPublicDTO;
}

/**
 * Composant d'affichage du prix du produit
 * Affiche le prix TTC en grand, ainsi que le prix HT et le taux de TVA
 *
 * @example
 * <PriceBox product={product} />
 */
const PriceBox: React.FC<PriceBoxProps> = ({ product }) => {
  /**
   * Utilise le prix TTC calculé côté serveur (garantit la cohérence et la sécurité)
   */
  const priceWithVat = product.priceTTC;
  return (
    <section className={styles.section}>
      {/* En-tête de la section prix */}
      <div className={styles.header}>
        <i className={`fas fa-euro-sign ${styles.headerIcon}`}></i>
        <span>Prix</span>
      </div>
      {/* Conteneur principal du prix */}
      <div className={styles.card}>
        {/* Élément décoratif en arrière-plan */}
        <div className={styles.accent} />

        {/* Section principale avec le prix TTC */}
        <div className={styles.body}>
          {/* Badge TTC */}
          <div className={styles.badge}>TTC</div>
          {/* Prix TTC en grand */}
          <div className={styles.price}>
            {Number(priceWithVat).toFixed(2)} €
          </div>
        </div>

        {/* Section détaillée avec prix HT et TVA */}
        <div className={styles.details}>
          {/* Prix HT */}
          <span>
            <i className={`fas fa-receipt ${styles.detailIcon}`}></i>
            HT : {Number(product.price).toFixed(2)} €
          </span>
          {/* Taux de TVA */}
          <span>
            <i className={`fas fa-percentage ${styles.detailIcon}`}></i>
            TVA : {product.vatRate}%
          </span>
          {/* Stock disponible */}
          <span>
            <i className={`fas fa-box ${styles.detailIcon}`}></i>
            Stock : {product.stock ?? 0}
          </span>
        </div>
      </div>
    </section>
  );
};

export default PriceBox;
