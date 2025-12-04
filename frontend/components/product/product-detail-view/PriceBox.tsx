import React from "react";
import { ProductPublicDTO } from "../../../dto";

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
    <section
      style={{
        display: "grid",
        rowGap: "0.5rem",
      }}
    >
      {/* En-tête de la section prix */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.6rem",
          color: "#13686a",
          fontWeight: 800,
          fontSize: "0.95rem",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}
      >
        <i className="fas fa-euro-sign"></i>
        <span>Prix</span>
      </div>
      {/* Conteneur principal du prix */}
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e6eef5",
          borderRadius: "12px",
          padding: "1rem 1.25rem",
          boxShadow: "0 10px 30px rgba(16,42,67,0.06)",
        }}
      >
        {/* Élément décoratif en arrière-plan */}
        <div
          style={{
            position: "absolute",
            top: "-20px",
            right: "-20px",
            width: "80px",
            height: "80px",
            background: "linear-gradient(135deg, #13686a 0%, #0dd3d1 100%)",
            borderRadius: "50%",
            opacity: 0.1,
          }}
        />

        {/* Section principale avec le prix TTC */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
          }}
        >
          {/* Badge TTC */}
          <div
            style={{
              display: "inline-block",
              padding: "0.4rem 1rem",
              background: "rgba(19, 104, 106, 0.1)",
              borderRadius: "20px",
              fontSize: "1rem",
              color: "#13686a",
              fontWeight: "600",
              marginBottom: "1rem",
            }}
          >
            TTC
          </div>
          {/* Prix TTC en grand */}
          <div
            className="price-value"
            style={{
              fontSize: "3rem",
              fontWeight: 900,
              color: "#13686a",
              marginBottom: "0.25rem",
              lineHeight: 1,
              letterSpacing: "-0.02em",
              textAlign: "right",
            }}
          >
            {Number(priceWithVat).toFixed(2)} €
          </div>
        </div>

        {/* Section détaillée avec prix HT et TVA */}
        <div
          style={{
            fontSize: "1rem",
            color: "#52606d",
            display: "flex",
            gap: "1.25rem",
            paddingTop: "0.75rem",
            borderTop: "1px solid #edf2f7",
          }}
        >
          {/* Prix HT */}
          <span>
            <i
              className="fas fa-receipt"
              style={{ marginRight: "0.5rem", color: "#13686a" }}
            ></i>
            HT : {Number(product.price).toFixed(2)} €
          </span>
          {/* Taux de TVA */}
          <span>
            <i
              className="fas fa-percentage"
              style={{ marginRight: "0.5rem", color: "#13686a" }}
            ></i>
            TVA : {product.vatRate}%
          </span>
        </div>
      </div>
    </section>
  );
};

export default PriceBox;
