"use client";

import Head from "next/head";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import AuthGuard from "../../components/auth/AuthGuard";
import { ProductList } from "../../components/product/product-list-view";

/**
 * Page de liste des produits
 *
 * Affiche la liste des produits avec filtres et actions
 * Protégée par AuthGuard (accessible uniquement si authentifié et approuvé)
 */
const ProductsPage: React.FC = () => {
  return (
    <AuthGuard>
      <Head>
        <title>Produits - Nature de Pierre</title>
        <meta name="description" content="Gérer les produits" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen">
        {/* HEADER */}
        <Header />

        {/* MAIN CONTENT */}
        <main className="main-content">
          <div className="page-container">
            <ProductList />
          </div>
        </main>

        {/* FOOTER */}
        <Footer />
      </div>
    </AuthGuard>
  );
};

export default ProductsPage;
