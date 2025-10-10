import React from "react";
import Link from "next/link";
import { ProductPublicDTO } from "../../dto";

/**
 * URL de l'API depuis les variables d'environnement
 * En développement, utiliser directement localhost:3020
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3020";

/**
 * Props du composant ProductCard
 */
interface ProductCardProps {
  /** Produit à afficher */
  product: ProductPublicDTO;
}

/**
 * Composant carte produit pour le frontend public
 * Affiche un produit avec son image, nom, prix et un lien vers le détail
 *
 * @example
 * <ProductCard product={product} />
 */
const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  /**
   * Formate un prix en euros (fr-BE)
   */
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-BE", {
      style: "currency",
      currency: "EUR",
    }).format(price);
  };

  /**
   * Récupère l'URL de la première image du produit
   */
  const getImageUrl = () => {
    if (product.images && product.images.length > 0) {
      const firstImage = product.images[0];
      // Utiliser le même format que le backoffice : filePath directement
      return `${API_URL}/${firstImage.filePath}`;
    }
    return "/images/placeholder.svg"; // Image par défaut
  };

  /**
   * Calcule le prix TTC (avec TVA)
   */
  const getPriceWithVat = () => {
    return product.price * (1 + product.vatRate / 100);
  };

  return (
    <div className="stone-description">
      <Link href={`/products/${product.id}`}>
        <div className="product-image-container">
          <img
            src={getImageUrl()}
            alt={product.name}
            className="product-image"
            onError={(e) => {
              // Si l'image ne charge pas, utiliser le placeholder
              (e.target as HTMLImageElement).src = "/images/placeholder.svg";
            }}
          />
        </div>
        <div
          className="text-description"
          style={{
            padding: "1.5rem",
          }}
        >
          {product.categoryName && (
            <div
              style={{
                display: "inline-block",
                padding: "0.4rem 1rem",
                background: "linear-gradient(135deg, #13686a 0%, #0dd3d1 100%)",
                color: "white",
                borderRadius: "20px",
                fontSize: "1rem",
                fontWeight: "600",
                marginBottom: "1rem",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              {product.categoryName}
            </div>
          )}
          <h3
            style={{
              fontSize: "1.8rem",
              fontWeight: "700",
              marginBottom: "0.8rem",
              color: "#1a1a1a",
            }}
          >
            {product.name}
          </h3>
          {product.description && (
            <p
              style={{
                fontSize: "1.2rem",
                color: "#666",
                marginBottom: "1.2rem",
                minHeight: "2.4rem",
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                lineHeight: "1.2",
              }}
            >
              {product.description}
            </p>
          )}
          <div
            className="price-container"
            style={{
              borderTop: "1px solid #e5e7eb",
              paddingTop: "1rem",
              marginTop: "1rem",
            }}
          >
            <span
              className="price-eur"
              style={{
                fontSize: "2.4rem",
                fontWeight: "800",
                color: "#13686a",
                display: "block",
                marginBottom: "0.3rem",
              }}
            >
              {formatPrice(getPriceWithVat())}
            </span>
            <span
              style={{
                fontSize: "1.1rem",
                color: "#9ca3af",
                fontWeight: "500",
              }}
            >
              TTC
            </span>
          </div>
          <button
            className="add-to-cart-btn"
            style={{
              marginTop: "1.2rem",
              width: "100%",
              padding: "1rem 1.5rem",
              background: "linear-gradient(135deg, #13686a 0%, #0dd3d1 100%)",
              border: "none",
              borderRadius: "8px",
              color: "white",
              fontSize: "1.3rem",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.3s ease",
              boxShadow: "0 2px 8px rgba(19, 104, 106, 0.2)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow =
                "0 4px 12px rgba(19, 104, 106, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 2px 8px rgba(19, 104, 106, 0.2)";
            }}
            onClick={(e) => {
              e.preventDefault();
              // TODO: Implémenter l'ajout au panier
              console.log("Ajouter au panier:", product.id);
            }}
          >
            <i className="fas fa-eye" style={{ marginRight: "0.5rem" }}></i>
            Voir le détail
          </button>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
