"use client";

import { useState } from "react";
import Head from "next/head";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function Home() {
  const [loading, setLoading] = useState(false);

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

        {/* FOOTER */}
        <Footer />
      </div>
    </>
  );
}
