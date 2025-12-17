"use client";

import Head from "next/head";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { ProductCatalog } from "../components/product";
import { useCatalog } from "../hooks";
import styles from "../styles/components/HomePage.module.css";

export default function Home() {
  const {
    selectedCategoryId,
    setSelectedCategoryId,
    products,
    isLoading,
    error,
    categories,
  } = useCatalog();

  return (
    <>
      <Head>
        <title>Catalogue - Nature de Pierre</title>
        <meta
          name="description"
          content="Découvrez notre collection de pierres naturelles de qualité"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className={styles.page}>
        {/* HEADER */}
        <Header />

        {/* PRODUCT CATALOG */}
        <ProductCatalog
          products={products}
          categories={categories}
          isLoading={isLoading}
          error={error}
          selectedCategoryId={selectedCategoryId}
          onCategoryChange={setSelectedCategoryId}
        />

        {/* FOOTER */}
        <Footer />
      </div>
    </>
  );
}
