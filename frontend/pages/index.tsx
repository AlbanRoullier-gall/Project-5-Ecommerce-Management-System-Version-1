"use client";

import Head from "next/head";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ProductCatalog from "../components/product/ProductCatalog";

export default function Home() {
  return (
    <>
      <Head>
        <title>Nature de Pierre - Pierre Naturelle</title>
        <meta
          name="description"
          content="Découvrez notre collection de pierres naturelles de qualité"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
        />
      </Head>

      <div className="min-h-screen">
        {/* HEADER */}
        <Header />

        {/* HERO SECTION */}
        <section className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">NATURE DE PIERRE</h1>
            <p className="hero-subtitle">
              Découvrez notre collection exclusive de pierres naturelles
            </p>
          </div>
        </section>

        {/* PRODUCT CATALOG */}
        <ProductCatalog />

        {/* FOOTER */}
        <Footer />
      </div>
    </>
  );
}
