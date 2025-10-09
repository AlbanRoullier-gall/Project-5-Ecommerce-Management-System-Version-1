"use client";

import Head from "next/head";
import Header from "../components/Header";
import Footer from "../components/Footer";
import AuthGuard from "../components/auth/AuthGuard";
import ProductList from "../components/product/ProductList";

/**
 * Page de gestion des produits et catégories
 *
 * Utilise le composant ProductList qui gère :
 * - Affichage et filtrage des produits
 * - Création/édition/suppression de produits
 * - Gestion des images produits
 * - Gestion des catégories
 * - Activation/désactivation de produits
 *
 * Protégée par AuthGuard (accessible uniquement si authentifié et approuvé)
 */
const ProductsPage: React.FC = () => {
  return (
    <AuthGuard>
      <Head>
        <title>Gestion des Produits - Nature de Pierre</title>
        <meta name="description" content="Gérer les produits et catégories" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
        />
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
