"use client";

import Head from "next/head";
import { useRouter } from "next/router";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useProduct, useProductPage } from "../hooks";
import {
  ProductImageGallery,
  ProductInfo,
  ProductPriceBox,
} from "../components/product";
import styles from "../styles/components/ProductPage.module.css";

export default function ProductPage() {
  const router = useRouter();
  const { productId } = router.query;
  const { product, isLoading, error } = useProduct(
    productId as string | number | undefined
  );
  const {
    quantityInCart,
    isLoading: cartLoading,
    selectedImageIndex,
    setSelectedImageIndex,
    handleAddToCart,
    handleIncrement,
    handleDecrement,
    handleGoHome,
  } = useProductPage(product);

  if (isLoading) {
    return (
      <>
        <Head>
          <title>Chargement... - Nature de Pierre</title>
        </Head>
        <div className={styles.page}>
          <Header />
          <div className={styles.loading}>
            <i className={`fas fa-spinner fa-spin ${styles.loadingIcon}`}></i>
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
        <div className={styles.page}>
          <Header />
          <div className={`${styles.error}`}>
            <i
              className={`fas fa-exclamation-triangle ${styles.errorIcon}`}
            ></i>
            {error || "Produit non trouvé"}
            <br />
            <button
              onClick={handleGoHome}
              className={styles.errorButton}
              type="button"
            >
              <i className={`fas fa-home ${styles.iconLeft}`}></i>
              Retour à l'accueil
            </button>
          </div>
          <Footer />
        </div>
      </>
    );
  }

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

      <div className={styles.page}>
        <Header />

        <div className={styles.container}>
          <div className={styles.grid}>
            <ProductImageGallery
              product={product}
              selectedImageIndex={selectedImageIndex}
              setSelectedImageIndex={setSelectedImageIndex}
            />

            <div className={styles.stickySection}>
              <div className={styles.panel}>
                <ProductInfo product={product} />
                <ProductPriceBox product={product} />
                <div className={styles.actions}>
                  {quantityInCart === 0 ? (
                    <button
                      className={styles.addButton}
                      onClick={handleAddToCart}
                      disabled={cartLoading}
                      type="button"
                    >
                      <i
                        className={`fas fa-shopping-cart ${styles.iconLeft}`}
                      ></i>
                      {cartLoading ? "Ajout..." : "Ajouter au panier"}
                    </button>
                  ) : (
                    <div className={styles.qtyRow}>
                      <button
                        className={styles.qtyButton}
                        onClick={handleDecrement}
                        disabled={cartLoading}
                        type="button"
                      >
                        <i className="fas fa-minus"></i>
                      </button>

                      <div className={styles.qtyDisplay}>
                        {quantityInCart}{" "}
                        {quantityInCart > 1 ? "articles" : "article"}
                      </div>

                      <button
                        className={styles.qtyButton}
                        onClick={handleIncrement}
                        disabled={cartLoading}
                        type="button"
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
    </>
  );
}
