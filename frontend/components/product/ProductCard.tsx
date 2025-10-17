import React from "react";
import Link from "next/link";
import { ProductPublicDTO } from "../../dto";
import { useCart } from "../../contexts/CartContext";

/**
 * URL de l'API depuis les variables d'environnement
 * OBLIGATOIRE : La variable NEXT_PUBLIC_API_URL doit être définie dans .env.local ou .env.production
 *
 * Exemples :
 * - Développement : NEXT_PUBLIC_API_URL=http://localhost:3020
 * - Production : NEXT_PUBLIC_API_URL=https://api.votre-domaine.com
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

/**
 * Props du composant ProductCard
 */
interface ProductCardProps {
  /** Produit à afficher */
  product: ProductPublicDTO;
}

/**
 * Composant carte produit pour le frontend public
 * Affiche un produit avec son image, nom, prix et des contrôles pour le panier
 *
 * @example
 * <ProductCard product={product} />
 */
const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const { cart, addToCart, updateQuantity, removeFromCart, isLoading } =
    useCart();

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

  /**
   * Trouve l'article dans le panier s'il existe
   */
  const cartItem = cart?.items?.find((item) => item.productId === product.id);
  const quantityInCart = cartItem?.quantity || 0;

  /**
   * Gère l'ajout au panier
   */
  const handleAddToCart = async () => {
    try {
      await addToCart(product.id, 1, getPriceWithVat(), product.vatRate);
    } catch (error) {
      console.error("Erreur lors de l'ajout au panier:", error);
    }
  };

  /**
   * Gère l'augmentation de la quantité
   */
  const handleIncrement = async () => {
    try {
      await updateQuantity(product.id, quantityInCart + 1);
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
    }
  };

  /**
   * Gère la diminution de la quantité
   */
  const handleDecrement = async () => {
    if (quantityInCart <= 1) {
      // Si quantité = 1, on supprime l'article
      try {
        await removeFromCart(product.id);
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
      }
    } else {
      try {
        await updateQuantity(product.id, quantityInCart - 1);
      } catch (error) {
        console.error("Erreur lors de la mise à jour:", error);
      }
    }
  };

  return (
    <div
      style={{
        backgroundColor: "white",
        border: "1px solid #eaeef2",
        borderRadius: "12px",
        padding: 0,
        textAlign: "center",
        boxShadow: isHovered
          ? "0 10px 24px rgba(19, 104, 106, 0.12)"
          : "0 2px 12px rgba(0, 0, 0, 0.06)",
        transition: "box-shadow 0.3s ease, transform 0.3s ease",
        overflow: "hidden",
        width: "100%",
        position: "relative",
        transform: isHovered ? "translateY(-4px)" : "translateY(0)",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Section cliquable vers le détail */}
      <Link href={`/products/${product.id}`} style={{ textDecoration: "none" }}>
        <div
          style={{
            marginBottom: 0,
            borderRadius: 0,
            overflow: "hidden",
            border: "none",
            position: "relative",
            background: "#ffffff",
          }}
        >
          <img
            src={getImageUrl()}
            alt={product.name}
            style={{
              width: "100%",
              height: "220px",
              objectFit: "contain",
              backgroundColor: "#fafafa",
              transition: "transform 0.3s ease",
              transform: isHovered ? "scale(1.05)" : "scale(1)",
            }}
            onError={(e) => {
              // Si l'image ne charge pas, utiliser le placeholder
              (e.target as HTMLImageElement).src = "/images/placeholder.svg";
            }}
          />
        </div>

        <div
          style={{
            padding: "1rem 1rem 0.75rem 1rem",
          }}
        >
          {product.categoryName && (
            <div
              style={{
                display: "inline-block",
                padding: "0.35rem 0.9rem",
                background: "rgba(19, 104, 106, 0.08)",
                color: "#13686a",
                borderRadius: "9999px",
                border: "1px solid rgba(19, 104, 106, 0.2)",
                fontSize: "0.9rem",
                fontWeight: "600",
                marginBottom: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.4px",
              }}
            >
              {product.categoryName}
            </div>
          )}
          <h3
            style={{
              fontSize: "1.5rem",
              fontWeight: "700",
              marginBottom: "0.5rem",
              color: "#1a1a1a",
            }}
          >
            {product.name}
          </h3>
          {product.description && (
            <p
              style={{
                fontSize: "1rem",
                color: "#6b7280",
                marginBottom: "1rem",
                minHeight: "2.4rem",
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                lineHeight: "1.5",
              }}
            >
              {product.description}
            </p>
          )}
          <div
            style={{
              borderTop: "1px solid #eef2f7",
              paddingTop: "0.75rem",
              marginTop: "0.75rem",
            }}
          >
            <span
              style={{
                fontSize: "1.8rem",
                fontWeight: "700",
                color: "#13686a",
                display: "block",
                marginBottom: "0.25rem",
              }}
            >
              {formatPrice(getPriceWithVat())}
            </span>
            <span
              style={{
                fontSize: "0.9rem",
                color: "#9ca3af",
                fontWeight: "500",
              }}
            >
              TTC
            </span>
          </div>
        </div>
      </Link>

      {/* Contrôles du panier - non cliquables vers le détail */}
      <div
        style={{
          padding: "0 1rem 1rem 1rem",
        }}
      >
        {quantityInCart === 0 ? (
          // Bouton Ajouter au panier
          <button
            style={{
              width: "100%",
              padding: "0.9rem 1.2rem",
              background: "linear-gradient(135deg, #13686a 0%, #0dd3d1 100%)",
              border: "none",
              borderRadius: "10px",
              color: "white",
              fontSize: "1.1rem",
              fontWeight: "600",
              cursor: isLoading ? "not-allowed" : "pointer",
              transition: "all 0.3s ease",
              boxShadow: "0 2px 8px rgba(19, 104, 106, 0.2)",
              opacity: isLoading ? 0.6 : 1,
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow =
                  "0 4px 12px rgba(19, 104, 106, 0.3)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 2px 8px rgba(19, 104, 106, 0.2)";
            }}
            onClick={handleAddToCart}
            disabled={isLoading}
          >
            <i
              className="fas fa-shopping-cart"
              style={{ marginRight: "0.5rem" }}
            ></i>
            {isLoading ? "Ajout..." : "Ajouter au panier"}
          </button>
        ) : (
          // Contrôles de quantité
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "0.5rem",
            }}
          >
            <button
              style={{
                flex: "0 0 auto",
                width: "38px",
                height: "38px",
                background: "linear-gradient(135deg, #13686a 0%, #0dd3d1 100%)",
                border: "none",
                borderRadius: "10px",
                color: "white",
                fontSize: "1.2rem",
                fontWeight: "600",
                cursor: isLoading ? "not-allowed" : "pointer",
                transition: "all 0.3s ease",
                boxShadow: "0 2px 8px rgba(19, 104, 106, 0.2)",
                opacity: isLoading ? 0.6 : 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onClick={handleDecrement}
              disabled={isLoading}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.transform = "scale(1.1)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              <i className="fas fa-minus"></i>
            </button>

            <div
              style={{
                flex: "1",
                padding: "0.7rem 1rem",
                background: "#f3f4f6",
                borderRadius: "10px",
                fontSize: "1.1rem",
                fontWeight: "700",
                color: "#13686a",
                textAlign: "center",
              }}
            >
              {quantityInCart} {quantityInCart > 1 ? "articles" : "article"}
            </div>

            <button
              style={{
                flex: "0 0 auto",
                width: "38px",
                height: "38px",
                background: "linear-gradient(135deg, #13686a 0%, #0dd3d1 100%)",
                border: "none",
                borderRadius: "10px",
                color: "white",
                fontSize: "1.2rem",
                fontWeight: "600",
                cursor: isLoading ? "not-allowed" : "pointer",
                transition: "all 0.3s ease",
                boxShadow: "0 2px 8px rgba(19, 104, 106, 0.2)",
                opacity: isLoading ? 0.6 : 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onClick={handleIncrement}
              disabled={isLoading}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.transform = "scale(1.1)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
              }}
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
