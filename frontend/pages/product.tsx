"use client";

import { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { ProductPublicDTO } from "../dto";
import { useCart } from "../contexts/CartContext";
import {
  ProductImageGallery,
  ProductInfo,
  ProductPriceBox,
} from "../components/product";

const API_URL = (() => {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (!url) {
    throw new Error(
      "NEXT_PUBLIC_API_URL n'est pas définie. Veuillez configurer cette variable d'environnement."
    );
  }
  return url;
})();

export default function ProductPage() {
  const router = useRouter();
  const { productId } = router.query;
  const {
    cart,
    addToCart,
    updateQuantity,
    removeFromCart,
    isLoading: cartLoading,
  } = useCart();

  const [product, setProduct] = useState<ProductPublicDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    if (productId) {
      loadProduct();
    }
  }, [productId]);

  // Plus de synchronisation de quantité locale: on s'aligne sur le comportement du catalogue

  const loadProduct = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/products/${productId}`, {
        credentials: "include", // Important pour CORS avec credentials: true
      });
      if (!response.ok) {
        throw new Error("Produit non trouvé");
      }
      const data = await response.json();
      const productData = data.product || data;
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

  if (isLoading) {
    return (
      <>
        <Head>
          <title>Chargement... - Nature de Pierre</title>
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

  // Récupérer la quantité du produit dans le panier
  const quantityInCart =
    cart?.items?.find((item) => item.productId === product.id)?.quantity || 0;

  return (
    <>
      <Head>
        <title>{product.name} - Nature de Pierre</title>
        <meta
          name="description"
          content={product.description || `Découvrez ${product.name}`}
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div
        className="min-h-screen"
        style={{
          backgroundImage:
            "radial-gradient( circle at 10% 10%, rgba(13,211,209,0.10) 0%, transparent 40%), radial-gradient( circle at 90% 30%, rgba(19,104,106,0.08) 0%, transparent 35%), linear-gradient(to bottom, #f8f9fa 0%, #ffffff 50%, #f8f9fa 100%)",
        }}
      >
        <Header />

        <div
          className="product-detail-container"
          style={{
            maxWidth: "1280px",
            margin: "3rem auto 5rem",
            padding: "0 2rem",
          }}
        >
          <div
            className="product-detail-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "1.2fr 1fr",
              gap: "3rem",
              alignItems: "stretch",
            }}
          >
            <ProductImageGallery
              product={product}
              selectedImageIndex={selectedImageIndex}
              setSelectedImageIndex={setSelectedImageIndex}
            />

            <div
              className="product-info-section"
              style={{ position: "sticky", top: "2rem", height: "100%" }}
            >
              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid #e6eef5",
                  borderRadius: "16px",
                  boxShadow: "0 10px 30px rgba(16,42,67,0.06)",
                  padding: "1rem 1.25rem",
                  display: "grid",
                  rowGap: "1rem",
                  height: "100%",
                }}
              >
                <ProductInfo product={product} />
                <ProductPriceBox product={product} />
                <div
                  style={{
                    padding: "0 0 0.75rem 0",
                    borderTop: "1px solid #eef2f7",
                    marginTop: "0.25rem",
                  }}
                >
                  {quantityInCart === 0 ? (
                    <button
                      style={{
                        width: "100%",
                        padding: "0.9rem 1.2rem",
                        background:
                          "linear-gradient(135deg, #13686a 0%, #0dd3d1 100%)",
                        border: "none",
                        borderRadius: "10px",
                        color: "white",
                        fontSize: "1.1rem",
                        fontWeight: "600",
                        cursor: cartLoading ? "not-allowed" : "pointer",
                        transition: "all 0.3s ease",
                        boxShadow: "0 2px 8px rgba(19, 104, 106, 0.2)",
                        opacity: cartLoading ? 0.6 : 1,
                      }}
                      onMouseEnter={(e) => {
                        if (!cartLoading) {
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
                      onClick={async () => {
                        // Utiliser le prix TTC calculé côté serveur (garantit la cohérence et la sécurité)
                        const priceWithVat = product.priceTTC;
                        const imageUrl =
                          product.images && product.images.length > 0
                            ? `${API_URL}/${product.images[0].filePath}`
                            : undefined;
                        await addToCart(
                          product.id,
                          1,
                          priceWithVat,
                          product.vatRate,
                          product.name,
                          product.description || undefined,
                          imageUrl
                        );
                      }}
                      disabled={cartLoading}
                    >
                      <i
                        className="fas fa-shopping-cart"
                        style={{ marginRight: "0.5rem" }}
                      ></i>
                      {cartLoading ? "Ajout..." : "Ajouter au panier"}
                    </button>
                  ) : (
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
                          background:
                            "linear-gradient(135deg, #13686a 0%, #0dd3d1 100%)",
                          border: "none",
                          borderRadius: "10px",
                          color: "white",
                          fontSize: "1.2rem",
                          fontWeight: "600",
                          cursor: cartLoading ? "not-allowed" : "pointer",
                          transition: "all 0.3s ease",
                          boxShadow: "0 2px 8px rgba(19, 104, 106, 0.2)",
                          opacity: cartLoading ? 0.6 : 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        onClick={async () => {
                          if (quantityInCart <= 1) {
                            await removeFromCart(product.id);
                          } else {
                            await updateQuantity(
                              product.id,
                              quantityInCart - 1
                            );
                          }
                        }}
                        disabled={cartLoading}
                        onMouseEnter={(e) => {
                          if (!cartLoading) {
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
                        {quantityInCart}{" "}
                        {quantityInCart > 1 ? "articles" : "article"}
                      </div>

                      <button
                        style={{
                          flex: "0 0 auto",
                          width: "38px",
                          height: "38px",
                          background:
                            "linear-gradient(135deg, #13686a 0%, #0dd3d1 100%)",
                          border: "none",
                          borderRadius: "10px",
                          color: "white",
                          fontSize: "1.2rem",
                          fontWeight: "600",
                          cursor: cartLoading ? "not-allowed" : "pointer",
                          transition: "all 0.3s ease",
                          boxShadow: "0 2px 8px rgba(19, 104, 106, 0.2)",
                          opacity: cartLoading ? 0.6 : 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        onClick={async () => {
                          await updateQuantity(product.id, quantityInCart + 1);
                        }}
                        disabled={cartLoading}
                        onMouseEnter={(e) => {
                          if (!cartLoading) {
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
            </div>
          </div>
        </div>

        <Footer />
      </div>

      <style jsx global>{`
        @media (max-width: 1024px) {
          .product-detail-grid {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
          .product-info-section {
            position: static !important;
          }
          .main-product-image {
            height: 400px !important;
          }
          .thumbnail-button,
          .thumbnail-image {
            width: 90px !important;
            height: 90px !important;
            min-width: 90px !important;
          }
        }
        @media (max-width: 768px) {
          .product-detail-grid {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
          .main-product-image {
            height: 300px !important;
          }
          .thumbnail-button,
          .thumbnail-image {
            width: 70px !important;
            height: 70px !important;
            min-width: 70px !important;
          }
          .product-title {
            font-size: 2.5rem !important;
          }
          .category-badge {
            font-size: 0.9rem !important;
            padding: 0.5rem 1rem !important;
          }
          .product-description {
            font-size: 1.2rem !important;
            padding: 1.5rem !important;
          }
          .price-value {
            font-size: 3rem !important;
          }
          .quantity-button {
            width: 50px !important;
            height: 50px !important;
            font-size: 1.5rem !important;
          }
          .quantity-display {
            font-size: 1.5rem !important;
            padding: 1rem !important;
          }
          .add-to-cart-button {
            padding: 1.5rem !important;
            font-size: 1.5rem !important;
          }
          .product-detail-container {
            margin: 2rem auto !important;
            padding: 0 1rem !important;
          }
        }
        @media (max-width: 480px) {
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
