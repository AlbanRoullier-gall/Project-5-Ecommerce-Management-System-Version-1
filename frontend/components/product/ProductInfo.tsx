import React from "react";
import { ProductPublicDTO } from "../../dto";

/**
 * Props du composant ProductInfo
 */
interface ProductInfoProps {
  /** Produit à afficher */
  product: ProductPublicDTO;
}

/**
 * Composant d'affichage des informations du produit
 * Affiche le nom, la catégorie et la description du produit
 *
 * @example
 * <ProductInfo product={product} />
 */
const ProductInfo: React.FC<ProductInfoProps> = ({ product }) => {
  return (
    <>
      {/* Badge de catégorie - affiché uniquement si la catégorie existe */}
      {product.categoryName && (
        <div
          className="category-badge"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.5rem 1rem",
            background: "rgba(19,104,106,0.08)",
            color: "#13686a",
            borderRadius: "9999px",
            border: "1px solid rgba(19,104,106,0.18)",
            fontSize: "0.9rem",
            fontWeight: 700,
            marginBottom: "0.25rem",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          <i className="fas fa-tag"></i>
          {product.categoryName}
        </div>
      )}

      {/* Titre du produit */}
      <h1
        className="product-title"
        style={{
          fontSize: "2.4rem",
          color: "#102a43",
          marginBottom: 0,
          fontWeight: 800,
          lineHeight: 1.15,
        }}
      >
        {product.name}
      </h1>

      {/* Section description - affichée uniquement si la description existe */}
      {product.description && (
        <section
          className="product-description"
          style={{
            display: "grid",
            rowGap: "0.25rem",
            padding: 0,
            margin: 0,
          }}
        >
          {/* En-tête de la section description */}
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
            <i className="fas fa-info-circle"></i>
            <span>Description</span>
          </div>
          {/* Contenu de la description */}
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e6eef5",
              borderRadius: "12px",
              padding: "1rem 1.25rem",
              color: "#334e68",
              fontSize: "1.05rem",
              lineHeight: 1.8,
              minHeight: "200px",
            }}
          >
            {product.description}
          </div>
        </section>
      )}
    </>
  );
};

export default ProductInfo;
