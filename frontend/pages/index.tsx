"use client";

import Head from "next/head";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ProductCatalog from "../components/catalog/ProductCatalog";

export default function Home() {
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

      <div style={{ minHeight: "100vh", background: "#f8f9fa" }}>
        {/* HEADER */}
        <Header />

        {/* PRODUCT CATALOG */}
        <ProductCatalog />

        {/* FOOTER */}
        <Footer />
      </div>
    </>
  );
}
