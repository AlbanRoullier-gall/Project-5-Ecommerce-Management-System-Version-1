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
  ProductQuantitySelector,
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
  const { cart, addToCart, updateQuantity, isLoading: cartLoading } = useCart();

  const [product, setProduct] = useState<ProductPublicDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (productId) {
      loadProduct();
    }
  }, [productId]);

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

  const loadProduct = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/products/${productId}`);
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

  // Sync quantity change directly to cart (auto-update)
  useEffect(() => {
    const sync = async () => {
      if (!product) return;
      setSyncing(true);
      try {
        const cartItem = cart?.items?.find(
          (item) => item.productId === product.id
        );
        if (quantity <= 0 && cartItem) {
          // Quantity should never be <1 from UI, but guard just in case
          await updateQuantity(product.id, 1);
        } else if (cartItem) {
          await updateQuantity(product.id, quantity);
        } else {
          const priceWithVat = product.price * (1 + product.vatRate / 100);
          await addToCart(product.id, quantity, priceWithVat, product.vatRate);
        }
      } catch (e) {
        console.error("Auto-update cart failed:", e);
      } finally {
        setSyncing(false);
      }
    };
    // Only sync when we have a product and a valid quantity
    if (product && quantity >= 1) {
      sync();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quantity, product?.id]);

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
      </Head>

      <div
        className="min-h-screen"
        style={{
          backgroundImage:
            "radial-gradient( circle at 10% 10%, rgba(13,211,209,0.10) 0%, transparent 40%), radial-gradient( circle at 90% 30%, rgba(19,104,106,0.08) 0%, transparent 35%), linear-gradient(to bottom, #f8f9fa 0%, #ffffff 50%, #f8f9fa 100%)",
        }}
      >
        <Header />

        {/* Breadcrumb supprimé */}

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
                <ProductQuantitySelector
                  quantity={quantity}
                  onChange={handleQuantityChange}
                  disabled={syncing || cartLoading}
                />
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
          .breadcrumb-container {
            font-size: 1rem !important;
            flex-wrap: wrap !important;
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
