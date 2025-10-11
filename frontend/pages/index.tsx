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
      </Head>

      <div style={{ minHeight: "100vh" }}>
        {/* HEADER */}
        <Header />

        {/* HERO SECTION */}
        <section
          style={{
            background: "linear-gradient(135deg, #13686a 0%, #0d4f51 100%)",
            color: "white",
            textAlign: "center",
            padding: "4rem 2rem",
            marginBottom: "2rem",
          }}
        >
          <div
            style={{
              maxWidth: "800px",
              margin: "0 auto",
            }}
          >
            <h1
              style={{
                fontSize: "4rem",
                fontWeight: "lighter",
                marginBottom: "1rem",
                textShadow: "2px 2px 4px rgba(0, 0, 0, 0.3)",
              }}
            >
              NATURE DE PIERRE
            </h1>
            <p
              style={{
                fontSize: "1.8rem",
                opacity: 0.9,
                lineHeight: 1.4,
              }}
            >
              Découvrez notre collection exclusive de pierres naturelles
            </p>
          </div>
        </section>

        {/* PRODUCT CATALOG */}
        <section id="catalog">
          <ProductCatalog />
        </section>

        {/* FOOTER */}
        <Footer />
      </div>
    </>
  );
}
