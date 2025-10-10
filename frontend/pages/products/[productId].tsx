"use client";

import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
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
 * Page de détail d'un produit
 * Affiche toutes les informations d'un produit avec ses images,
 * galerie de photos, prix, description et sélecteur de quantité
 */
export default function ProductDetailPage() {
  const router = useRouter();
  const { productId } = router.query;
  const { cart, addToCart, updateQuantity, isLoading: cartLoading } = useCart();

  const [product, setProduct] = useState<ProductPublicDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [imageHovered, setImageHovered] = useState(false);

  /**
   * Charge le produit depuis l'API
   */
  useEffect(() => {
    if (productId) {
      loadProduct();
    }
  }, [productId]);

  /**
   * Synchronise la quantité avec le panier
   * Si le produit est déjà dans le panier, afficher sa quantité
   */
  useEffect(() => {
    if (cart && productId) {
      const cartItem = cart.items?.find(
        (item) => item.productId === Number(productId)
      );
      if (cartItem) {
        setQuantity(cartItem.quantity);
      } else {
        setQuantity(1);
      }
    }
  }, [cart, productId]);

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
   * Gère l'ajout/mise à jour au panier
   */
  const handleAddToCart = async () => {
    if (!product) return;

    setAddingToCart(true);
    try {
      // Vérifier si le produit est déjà dans le panier
      const cartItem = cart?.items?.find(
        (item) => item.productId === product.id
      );

      if (cartItem) {
        // Produit déjà dans le panier : mettre à jour la quantité
        await updateQuantity(product.id, quantity);
        alert(`Quantité mise à jour : ${quantity} article(s) dans le panier !`);
      } else {
        // Nouveau produit : l'ajouter au panier
        const priceWithVat = product.price * (1 + product.vatRate / 100);
        await addToCart(product.id, quantity, priceWithVat);
        alert(`${quantity} article(s) ajouté(s) au panier avec succès !`);
      }

      // Optionnel: Réinitialiser la quantité ou rediriger vers le panier
      // setQuantity(1);
      // router.push('/cart');
    } catch (error) {
      console.error("Erreur lors de l'ajout au panier:", error);
      alert("Erreur lors de l'ajout au panier. Veuillez réessayer.");
    } finally {
      setAddingToCart(false);
    }
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

  // Vérifier si le produit est déjà dans le panier
  const isInCart =
    cart?.items?.some((item) => item.productId === product.id) || false;

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

      <div
        className="min-h-screen"
        style={{
          background:
            "linear-gradient(to bottom, #f8f9fa 0%, #ffffff 50%, #f8f9fa 100%)",
        }}
      >
        <Header />

        {/* Breadcrumb */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.9)",
            backdropFilter: "blur(10px)",
            padding: "1.2rem 2rem",
            borderBottom: "1px solid rgba(19, 104, 106, 0.1)",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
          }}
        >
          <div
            className="breadcrumb-container"
            style={{
              maxWidth: "1400px",
              margin: "0 auto",
              fontSize: "1.2rem",
              color: "#666",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <button
              onClick={() => router.push("/")}
              style={{
                background: "none",
                border: "none",
                color: "#13686a",
                cursor: "pointer",
                fontSize: "1.2rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.5rem 1rem",
                borderRadius: "6px",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(19, 104, 106, 0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "none";
              }}
            >
              <i className="fas fa-home"></i>
              Accueil
            </button>
            <i
              className="fas fa-chevron-right"
              style={{ fontSize: "0.9rem", color: "#999" }}
            ></i>
            <span style={{ color: "#999" }}>Produits</span>
            <i
              className="fas fa-chevron-right"
              style={{ fontSize: "0.9rem", color: "#999" }}
            ></i>
            <span style={{ color: "#13686a", fontWeight: "600" }}>
              {product.name}
            </span>
          </div>
        </div>

        {/* Product Detail */}
        <div
          className="product-detail-container"
          style={{
            maxWidth: "1400px",
            margin: "4rem auto",
            padding: "0 2rem",
          }}
        >
          <div
            className="product-detail-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "1.2fr 1fr",
              gap: "4rem",
              alignItems: "start",
            }}
          >
            {/* Images Section */}
            <div>
              {/* Main Image */}
              <div
                style={{
                  background: "white",
                  borderRadius: "24px",
                  overflow: "hidden",
                  marginBottom: "1.5rem",
                  boxShadow: imageHovered
                    ? "0 20px 60px rgba(19, 104, 106, 0.2)"
                    : "0 10px 40px rgba(0, 0, 0, 0.1)",
                  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                  position: "relative",
                  transform: imageHovered
                    ? "translateY(-4px)"
                    : "translateY(0)",
                }}
                onMouseEnter={() => setImageHovered(true)}
                onMouseLeave={() => setImageHovered(false)}
              >
                {/* Gradient overlay on hover */}
                {imageHovered && (
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: "6px",
                      background:
                        "linear-gradient(90deg, #13686a 0%, #0dd3d1 100%)",
                      zIndex: 10,
                    }}
                  />
                )}
                {product.images && product.images.length > 0 ? (
                  <img
                    className="main-product-image"
                    src={getImageUrl(product.images[selectedImageIndex].id)}
                    alt={product.name}
                    style={{
                      width: "100%",
                      height: "550px",
                      objectFit: "cover",
                      transition: "transform 0.4s ease",
                      transform: imageHovered ? "scale(1.02)" : "scale(1)",
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "/images/placeholder.svg";
                    }}
                  />
                ) : (
                  <img
                    className="main-product-image"
                    src="/images/placeholder.svg"
                    alt="Pas d'image"
                    style={{
                      width: "100%",
                      height: "550px",
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
                    padding: "0.5rem 0",
                  }}
                >
                  {product.images.map((image, index) => (
                    <button
                      key={image.id}
                      className="thumbnail-button"
                      onClick={() => setSelectedImageIndex(index)}
                      style={{
                        border: "none",
                        borderRadius: "12px",
                        overflow: "hidden",
                        cursor: "pointer",
                        padding: 0,
                        background: "white",
                        minWidth: "110px",
                        boxShadow:
                          selectedImageIndex === index
                            ? "0 0 0 3px #13686a, 0 6px 20px rgba(19, 104, 106, 0.3)"
                            : "0 4px 12px rgba(0, 0, 0, 0.1)",
                        transition: "all 0.3s ease",
                        transform:
                          selectedImageIndex === index
                            ? "scale(1.05)"
                            : "scale(1)",
                        position: "relative",
                      }}
                      onMouseEnter={(e) => {
                        if (selectedImageIndex !== index) {
                          e.currentTarget.style.transform = "scale(1.05)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedImageIndex !== index) {
                          e.currentTarget.style.transform = "scale(1)";
                        }
                      }}
                    >
                      {selectedImageIndex === index && (
                        <div
                          style={{
                            position: "absolute",
                            top: "5px",
                            right: "5px",
                            background:
                              "linear-gradient(135deg, #13686a 0%, #0dd3d1 100%)",
                            color: "white",
                            borderRadius: "50%",
                            width: "24px",
                            height: "24px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.8rem",
                            zIndex: 10,
                          }}
                        >
                          <i className="fas fa-check"></i>
                        </div>
                      )}
                      <img
                        className="thumbnail-image"
                        src={getImageUrl(image.id)}
                        alt={`${product.name} - ${index + 1}`}
                        style={{
                          width: "110px",
                          height: "110px",
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
            <div
              className="product-info-section"
              style={{
                position: "sticky",
                top: "2rem",
              }}
            >
              {/* Category Badge */}
              {product.categoryName && (
                <div
                  className="category-badge"
                  style={{
                    display: "inline-block",
                    padding: "0.6rem 1.5rem",
                    background:
                      "linear-gradient(135deg, #13686a 0%, #0dd3d1 100%)",
                    color: "white",
                    borderRadius: "25px",
                    fontSize: "1.1rem",
                    fontWeight: "600",
                    marginBottom: "1.5rem",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    boxShadow: "0 4px 15px rgba(19, 104, 106, 0.3)",
                  }}
                >
                  <i
                    className="fas fa-tag"
                    style={{ marginRight: "0.5rem" }}
                  ></i>
                  {product.categoryName}
                </div>
              )}

              <h1
                className="product-title"
                style={{
                  fontSize: "3.5rem",
                  color: "#1a1a1a",
                  marginBottom: "1.5rem",
                  fontWeight: "800",
                  lineHeight: "1.2",
                  background:
                    "linear-gradient(135deg, #1a1a1a 0%, #13686a 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {product.name}
              </h1>

              {product.description && (
                <div
                  className="product-description"
                  style={{
                    fontSize: "1.4rem",
                    color: "#555",
                    lineHeight: "1.8",
                    marginBottom: "2.5rem",
                    padding: "2rem",
                    background: "rgba(255, 255, 255, 0.8)",
                    backdropFilter: "blur(10px)",
                    borderRadius: "16px",
                    border: "1px solid rgba(19, 104, 106, 0.1)",
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.8rem",
                      marginBottom: "1rem",
                      color: "#13686a",
                      fontWeight: "600",
                      fontSize: "1.2rem",
                    }}
                  >
                    <i className="fas fa-info-circle"></i>
                    <span>Description</span>
                  </div>
                  {product.description}
                </div>
              )}

              {/* Price */}
              <div
                style={{
                  background:
                    "linear-gradient(135deg, rgba(19, 104, 106, 0.05) 0%, rgba(13, 211, 209, 0.05) 100%)",
                  border: "2px solid transparent",
                  backgroundImage:
                    "linear-gradient(white, white), linear-gradient(135deg, #13686a 0%, #0dd3d1 100%)",
                  backgroundOrigin: "border-box",
                  backgroundClip: "padding-box, border-box",
                  borderRadius: "20px",
                  padding: "2.5rem",
                  marginBottom: "2.5rem",
                  boxShadow: "0 10px 30px rgba(19, 104, 106, 0.15)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Decorative corner */}
                <div
                  style={{
                    position: "absolute",
                    top: "-20px",
                    right: "-20px",
                    width: "80px",
                    height: "80px",
                    background:
                      "linear-gradient(135deg, #13686a 0%, #0dd3d1 100%)",
                    borderRadius: "50%",
                    opacity: 0.1,
                  }}
                />

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    marginBottom: "1rem",
                    color: "#13686a",
                    fontSize: "1.2rem",
                    fontWeight: "600",
                  }}
                >
                  <i className="fas fa-euro-sign"></i>
                  <span>Prix</span>
                </div>

                <div
                  className="price-value"
                  style={{
                    fontSize: "4rem",
                    fontWeight: "900",
                    background:
                      "linear-gradient(135deg, #13686a 0%, #0dd3d1 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    marginBottom: "0.5rem",
                    lineHeight: "1",
                  }}
                >
                  {formatPrice(priceWithVat)}
                </div>

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

                <div
                  style={{
                    fontSize: "1.15rem",
                    color: "#666",
                    display: "flex",
                    gap: "1.5rem",
                    paddingTop: "1rem",
                    borderTop: "1px solid rgba(19, 104, 106, 0.1)",
                  }}
                >
                  <span>
                    <i
                      className="fas fa-receipt"
                      style={{ marginRight: "0.5rem", color: "#13686a" }}
                    ></i>
                    HT : {formatPrice(product.price)}
                  </span>
                  <span>
                    <i
                      className="fas fa-percentage"
                      style={{ marginRight: "0.5rem", color: "#13686a" }}
                    ></i>
                    TVA : {product.vatRate}%
                  </span>
                </div>
              </div>

              {/* Quantity Selector */}
              <div
                style={{
                  marginBottom: "2.5rem",
                  background: "white",
                  padding: "2rem",
                  borderRadius: "16px",
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    marginBottom: "1.5rem",
                    color: "#13686a",
                    fontSize: "1.2rem",
                    fontWeight: "600",
                  }}
                >
                  <i className="fas fa-box"></i>
                  <span>Quantité</span>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1.5rem",
                  }}
                >
                  <button
                    className="quantity-button"
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                    style={{
                      width: "60px",
                      height: "60px",
                      background:
                        quantity <= 1
                          ? "#f3f4f6"
                          : "linear-gradient(135deg, #13686a 0%, #0dd3d1 100%)",
                      color: quantity <= 1 ? "#ccc" : "white",
                      border: "none",
                      fontSize: "2rem",
                      cursor: quantity <= 1 ? "not-allowed" : "pointer",
                      borderRadius: "12px",
                      fontWeight: "bold",
                      transition: "all 0.3s ease",
                      boxShadow:
                        quantity <= 1
                          ? "none"
                          : "0 4px 12px rgba(19, 104, 106, 0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    onMouseEnter={(e) => {
                      if (quantity > 1) {
                        e.currentTarget.style.transform = "scale(1.05)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "scale(1)";
                    }}
                  >
                    <i className="fas fa-minus"></i>
                  </button>

                  <div
                    className="quantity-display"
                    style={{
                      flex: 1,
                      textAlign: "center",
                      padding: "1.2rem",
                      background:
                        "linear-gradient(135deg, rgba(19, 104, 106, 0.05) 0%, rgba(13, 211, 209, 0.05) 100%)",
                      borderRadius: "12px",
                      border: "2px solid rgba(19, 104, 106, 0.2)",
                      fontSize: "2rem",
                      fontWeight: "700",
                      color: "#13686a",
                    }}
                  >
                    {quantity}
                  </div>

                  <button
                    className="quantity-button"
                    onClick={() => handleQuantityChange(quantity + 1)}
                    style={{
                      width: "60px",
                      height: "60px",
                      background:
                        "linear-gradient(135deg, #13686a 0%, #0dd3d1 100%)",
                      color: "white",
                      border: "none",
                      fontSize: "2rem",
                      cursor: "pointer",
                      borderRadius: "12px",
                      fontWeight: "bold",
                      transition: "all 0.3s ease",
                      boxShadow: "0 4px 12px rgba(19, 104, 106, 0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "scale(1.05)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "scale(1)";
                    }}
                  >
                    <i className="fas fa-plus"></i>
                  </button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <button
                className="add-to-cart-button"
                onClick={handleAddToCart}
                disabled={addingToCart || cartLoading}
                style={{
                  width: "100%",
                  padding: "2rem",
                  background:
                    addingToCart || cartLoading
                      ? "linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)"
                      : "linear-gradient(135deg, #13686a 0%, #0dd3d1 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: "16px",
                  fontSize: "1.8rem",
                  fontWeight: "800",
                  cursor:
                    addingToCart || cartLoading ? "not-allowed" : "pointer",
                  transition: "all 0.3s ease",
                  boxShadow:
                    addingToCart || cartLoading
                      ? "0 4px 12px rgba(0, 0, 0, 0.1)"
                      : "0 8px 25px rgba(19, 104, 106, 0.4)",
                  opacity: addingToCart || cartLoading ? 0.8 : 1,
                  position: "relative",
                  overflow: "hidden",
                }}
                onMouseEnter={(e) => {
                  if (!addingToCart && !cartLoading) {
                    e.currentTarget.style.transform = "translateY(-3px)";
                    e.currentTarget.style.boxShadow =
                      "0 12px 35px rgba(19, 104, 106, 0.5)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 25px rgba(19, 104, 106, 0.4)";
                }}
              >
                {addingToCart || cartLoading ? (
                  <>
                    <i
                      className="fas fa-spinner fa-spin"
                      style={{ marginRight: "1rem" }}
                    ></i>
                    {isInCart ? "Mise à jour..." : "Ajout en cours..."}
                  </>
                ) : (
                  <>
                    <i
                      className={
                        isInCart ? "fas fa-sync-alt" : "fas fa-shopping-cart"
                      }
                      style={{ marginRight: "1rem" }}
                    ></i>
                    {isInCart ? "Mettre à jour le panier" : "Ajouter au panier"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <Footer />
      </div>

      <style jsx global>{`
        @media (max-width: 1024px) {
          /* Ajuster la grille pour tablettes */
          .product-detail-grid {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }

          /* Supprimer le sticky sur mobile/tablette */
          .product-info-section {
            position: static !important;
          }

          /* Réduire l'image sur tablette */
          .main-product-image {
            height: 400px !important;
          }

          /* Réduire les thumbnails */
          .thumbnail-button,
          .thumbnail-image {
            width: 90px !important;
            height: 90px !important;
            min-width: 90px !important;
          }
        }

        @media (max-width: 768px) {
          /* Mobile - grille en une colonne */
          .product-detail-grid {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }

          /* Réduire l'image principale sur mobile */
          .main-product-image {
            height: 300px !important;
          }

          /* Réduire les thumbnails sur mobile */
          .thumbnail-button,
          .thumbnail-image {
            width: 70px !important;
            height: 70px !important;
            min-width: 70px !important;
          }

          /* Ajuster le titre */
          .product-title {
            font-size: 2.5rem !important;
          }

          /* Ajuster le badge catégorie */
          .category-badge {
            font-size: 0.9rem !important;
            padding: 0.5rem 1rem !important;
          }

          /* Ajuster la description */
          .product-description {
            font-size: 1.2rem !important;
            padding: 1.5rem !important;
          }

          /* Ajuster le prix */
          .price-value {
            font-size: 3rem !important;
          }

          /* Ajuster les contrôles de quantité */
          .quantity-button {
            width: 50px !important;
            height: 50px !important;
            font-size: 1.5rem !important;
          }

          .quantity-display {
            font-size: 1.5rem !important;
            padding: 1rem !important;
          }

          /* Ajuster le bouton d'ajout au panier */
          .add-to-cart-button {
            padding: 1.5rem !important;
            font-size: 1.5rem !important;
          }

          /* Ajuster le breadcrumb */
          .breadcrumb-container {
            font-size: 1rem !important;
            flex-wrap: wrap !important;
          }

          /* Réduire les marges sur mobile */
          .product-detail-container {
            margin: 2rem auto !important;
            padding: 0 1rem !important;
          }
        }

        @media (max-width: 480px) {
          /* Très petits écrans */
          .product-title {
            font-size: 2rem !important;
          }

          .main-product-image {
            height: 250px !important;
          }

          .price-value {
            font-size: 2.5rem !important;
          }

          .add-to-cart-button {
            font-size: 1.3rem !important;
          }
        }
      `}</style>
    </>
  );
}
