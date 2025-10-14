"use client";

import Head from "next/head";
import Header from "../components/Header";
import Footer from "../components/Footer";
import AuthGuard from "../components/auth/AuthGuard";
import CustomerList from "../components/customer/CustomerList";

/**
 * Page de gestion des clients
 *
 * Utilise le composant CustomerList qui gère :
 * - Affichage et filtrage des clients
 * - Création/édition/suppression de clients
 * - Gestion des adresses (multiple adresses par client)
 * - Activation/désactivation de clients
 *
 * Protégée par AuthGuard (accessible uniquement si authentifié et approuvé)
 */
const CustomersPage: React.FC = () => {
  return (
    <AuthGuard>
      <Head>
        <title>Gestion des Clients - Nature de Pierre</title>
        <meta
          name="description"
          content="Gérer les clients et leurs adresses"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen">
        {/* HEADER */}
        <Header />

        {/* MAIN CONTENT */}
        <main className="main-content">
          <div className="page-container">
            <CustomerList />
          </div>
        </main>

        {/* FOOTER */}
        <Footer />
      </div>
    </AuthGuard>
  );
};

export default CustomersPage;
