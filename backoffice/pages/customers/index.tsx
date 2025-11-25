"use client";

import Head from "next/head";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import AuthGuard from "../../components/auth/AuthGuard";
import { CustomerList } from "../../components/customer/customer-list-view";

/**
 * Page de liste des clients
 *
 * Affiche la liste des clients avec filtres et actions
 * Protégée par AuthGuard (accessible uniquement si authentifié et approuvé)
 */
const CustomersPage: React.FC = () => {
  return (
    <AuthGuard>
      <Head>
        <title>Clients - Nature de Pierre</title>
        <meta name="description" content="Gérer les clients" />
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
