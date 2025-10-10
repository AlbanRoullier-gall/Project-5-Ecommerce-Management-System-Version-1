"use client";

import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { ProductPublicDTO } from "../../dto";

/**
 * URL de l'API depuis les variables d'environnement
 * En développement, utiliser directement localhost:3020
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3020";

/**
 * Page de détail d'un produit
 * Affiche toutes les informations d'un produit avec ses images,
 * galerie de photos, prix, description et sélecteur de quantité
 */
export default function ProductDetailPage() {
  const router = useRouter();
  const { productId } = router.query;

  const [product, setProduct] = useState<ProductPublicDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  /**
   * Charge le produit depuis l'API
   */
  useEffect(() => {
    if (productId) {
      loadProduct();
    }
  }, [productId]);

  /**
   * Charge les détails d'un produit
   */
  const loadProduct = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/products/${productId}`);

      if (!response.ok) {
        throw new Error("Produit non trouvé");
      }

      const data = await response.json();

      // L'API retourne {product: {...}} au lieu de directement le produit
      const productData = data.product || data;

      // Vérifier que le produit est actif
      if (!productData.isActive) {
        throw new Error("Ce produit n'est plus disponible");
      }

      setProduct(productData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erreur lors du chargement du produit"
      );
      console.error("Error loading product:", err);
    } finally {
      setIsLoading(false);
    }
  };

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
   * Calcule le prix TTC (avec TVA)
   */
  const getPriceWithVat = (price: number, vatRate: number) => {
    return price * (1 + vatRate / 100);
  };

  /**
   * Récupère l'URL d'une image
   */
  const getImageUrl = (imageId: number) => {
    // Trouver l'image dans le produit
    const image = product?.images?.find((img) => img.id === imageId);
    if (image) {
      // Utiliser le filePath comme dans le backoffice
      return `${API_URL}/${image.filePath}`;
    }
    return `${API_URL}/api/images/${imageId}`;
  };

  /**
   * Gère l'ajout au panier
   */
  const handleAddToCart = () => {
    // TODO: Implémenter l'ajout au panier
    console.log("Ajouter au panier:", product?.id, "Quantité:", quantity);
    alert(`${quantity} article(s) ajouté(s) au panier !`);
  };

  /**
   * Gère le changement de quantité
   */
  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  if (isLoading) {
    return (
      <>
        <Head>
          <title>Chargement... - Nature de Pierre</title>
          <link
            rel="stylesheet"
            href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
          />
        </Head>
        <div className="min-h-screen">
          <Header />
          <div
            style={{
              textAlign: "center",
              padding: "4rem",
              fontSize: "1.5rem",
              color: "#13686a",
            }}
          >
            <i
              className="fas fa-spinner fa-spin"
              style={{ marginRight: "1rem" }}
            ></i>
            Chargement du produit...
          </div>
          <Footer />
        </div>
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <Head>
          <title>Erreur - Nature de Pierre</title>
          <link
            rel="stylesheet"
            href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
          />
        </Head>
        <div className="min-h-screen">
          <Header />
          <div
            style={{
              textAlign: "center",
              padding: "4rem",
              fontSize: "1.5rem",
              color: "#c33",
            }}
          >
            <i
              className="fas fa-exclamation-triangle"
              style={{
                marginRight: "1rem",
                fontSize: "3rem",
                display: "block",
                marginBottom: "1rem",
              }}
            ></i>
            {error || "Produit non trouvé"}
            <br />
            <button
              onClick={() => router.push("/")}
              style={{
                marginTop: "2rem",
                padding: "1rem 2rem",
                background: "#13686a",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "1.2rem",
                cursor: "pointer",
              }}
            >
              <i className="fas fa-home" style={{ marginRight: "0.5rem" }}></i>
              Retour à l'accueil
            </button>
          </div>
          <Footer />
        </div>
      </>
    );
  }

  const priceWithVat = getPriceWithVat(product.price, product.vatRate);

  return (
    <>
      <Head>
        <title>{product.name} - Nature de Pierre</title>
        <meta
          name="description"
          content={product.description || `Découvrez ${product.name}`}
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
        />
      </Head>

      <div className="min-h-screen">
        <Header />

        {/* Breadcrumb */}
        <div
          style={{
            background: "#f8f9fa",
            padding: "1rem 2rem",
            borderBottom: "1px solid #ddd",
          }}
        >
          <div
            style={{
              maxWidth: "1200px",
              margin: "0 auto",
              fontSize: "1.2rem",
              color: "#666",
            }}
          >
            <button
              onClick={() => router.push("/")}
              style={{
                background: "none",
                border: "none",
                color: "#13686a",
                cursor: "pointer",
                textDecoration: "underline",
                fontSize: "1.2rem",
              }}
            >
              <i className="fas fa-home" style={{ marginRight: "0.5rem" }}></i>
              Accueil
            </button>
            <span style={{ margin: "0 1rem" }}>/</span>
            <span>Produits</span>
            <span style={{ margin: "0 1rem" }}>/</span>
            <span style={{ color: "#333", fontWeight: "600" }}>
              {product.name}
            </span>
          </div>
        </div>

        {/* Product Detail */}
        <div
          style={{
            maxWidth: "1200px",
            margin: "3rem auto",
            padding: "0 2rem",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "3rem",
              alignItems: "start",
            }}
          >
            {/* Images Section */}
            <div>
              {/* Main Image */}
              <div
                style={{
                  background: "white",
                  border: "2px solid #ddd",
                  borderRadius: "12px",
                  overflow: "hidden",
                  marginBottom: "1rem",
                }}
              >
                {product.images && product.images.length > 0 ? (
                  <img
                    src={getImageUrl(product.images[selectedImageIndex].id)}
                    alt={product.name}
                    style={{
                      width: "100%",
                      height: "500px",
                      objectFit: "cover",
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "/images/placeholder.svg";
                    }}
                  />
                ) : (
                  <img
                    src="/images/placeholder.svg"
                    alt="Pas d'image"
                    style={{
                      width: "100%",
                      height: "500px",
                      objectFit: "cover",
                    }}
                  />
                )}
              </div>

              {/* Thumbnails */}
              {product.images && product.images.length > 1 && (
                <div
                  style={{
                    display: "flex",
                    gap: "1rem",
                    overflowX: "auto",
                  }}
                >
                  {product.images.map((image, index) => (
                    <button
                      key={image.id}
                      onClick={() => setSelectedImageIndex(index)}
                      style={{
                        border:
                          selectedImageIndex === index
                            ? "3px solid #13686a"
                            : "2px solid #ddd",
                        borderRadius: "8px",
                        overflow: "hidden",
                        cursor: "pointer",
                        padding: 0,
                        background: "white",
                        minWidth: "100px",
                      }}
                    >
                      <img
                        src={getImageUrl(image.id)}
                        alt={`${product.name} - ${index + 1}`}
                        style={{
                          width: "100px",
                          height: "100px",
                          objectFit: "cover",
                          display: "block",
                        }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "/images/placeholder.svg";
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info Section */}
            <div>
              <h1
                style={{
                  fontSize: "3rem",
                  color: "#333",
                  marginBottom: "1rem",
                  fontWeight: "700",
                }}
              >
                {product.name}
              </h1>

              {product.categoryName && (
                <p
                  style={{
                    fontSize: "1.4rem",
                    color: "#13686a",
                    fontWeight: "600",
                    marginBottom: "1.5rem",
                  }}
                >
                  <i
                    className="fas fa-tag"
                    style={{ marginRight: "0.5rem" }}
                  ></i>
                  {product.categoryName}
                </p>
              )}

              {product.description && (
                <div
                  style={{
                    fontSize: "1.4rem",
                    color: "#666",
                    lineHeight: "1.6",
                    marginBottom: "2rem",
                    padding: "1.5rem",
                    background: "#f8f9fa",
                    borderRadius: "8px",
                  }}
                >
                  {product.description}
                </div>
              )}

              {/* Price */}
              <div
                style={{
                  background: "white",
                  border: "2px solid #13686a",
                  borderRadius: "12px",
                  padding: "2rem",
                  marginBottom: "2rem",
                }}
              >
                <div
                  style={{
                    fontSize: "3.5rem",
                    color: "#13686a",
                    fontWeight: "bold",
                    marginBottom: "0.5rem",
                  }}
                >
                  {formatPrice(priceWithVat)}
                  <span
                    style={{
                      fontSize: "1.2rem",
                      color: "#666",
                      marginLeft: "0.5rem",
                    }}
                  >
                    TTC
                  </span>
                </div>
                <div
                  style={{
                    fontSize: "1.2rem",
                    color: "#666",
                  }}
                >
                  Prix HT : {formatPrice(product.price)} • TVA :{" "}
                  {product.vatRate}%
                </div>
              </div>

              {/* Quantity Selector */}
              <div
                style={{
                  marginBottom: "2rem",
                }}
              >
                <label
                  style={{
                    display: "block",
                    fontSize: "1.4rem",
                    fontWeight: "600",
                    marginBottom: "1rem",
                    color: "#333",
                  }}
                >
                  Quantité :
                </label>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                  }}
                >
                  <button
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                    style={{
                      width: "50px",
                      height: "50px",
                      border: "2px solid #13686a",
                      background: "white",
                      color: "#13686a",
                      fontSize: "1.8rem",
                      cursor: "pointer",
                      borderRadius: "8px",
                      fontWeight: "bold",
                    }}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) =>
                      handleQuantityChange(parseInt(e.target.value) || 1)
                    }
                    min="1"
                    style={{
                      width: "100px",
                      height: "50px",
                      textAlign: "center",
                      border: "2px solid #ddd",
                      fontSize: "1.6rem",
                      borderRadius: "8px",
                      fontWeight: "600",
                    }}
                  />
                  <button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    style={{
                      width: "50px",
                      height: "50px",
                      border: "2px solid #13686a",
                      background: "white",
                      color: "#13686a",
                      fontSize: "1.8rem",
                      cursor: "pointer",
                      borderRadius: "8px",
                      fontWeight: "bold",
                    }}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                style={{
                  width: "100%",
                  padding: "1.5rem",
                  background:
                    "linear-gradient(135deg, #13686a 0%, #0dd3d1 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "1.6rem",
                  fontWeight: "bold",
                  cursor: "pointer",
                  transition: "transform 0.2s ease",
                  boxShadow: "0 4px 12px rgba(19, 104, 106, 0.3)",
                }}
                onMouseOver={(e) => {
                  (e.target as HTMLButtonElement).style.transform =
                    "translateY(-2px)";
                }}
                onMouseOut={(e) => {
                  (e.target as HTMLButtonElement).style.transform =
                    "translateY(0)";
                }}
              >
                <i
                  className="fas fa-shopping-cart"
                  style={{ marginRight: "1rem" }}
                ></i>
                Ajouter au panier
              </button>
            </div>
          </div>
        </div>

        <Footer />
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
}
