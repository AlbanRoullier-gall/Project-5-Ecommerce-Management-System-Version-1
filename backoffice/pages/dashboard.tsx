"use client";

import Head from "next/head";
import Header from "../components/Header";
import Footer from "../components/Footer";
import AuthGuard from "../components/auth/AuthGuard";
import StatsOverview from "../components/dashboard/StatsOverview";
import QuickActions from "../components/dashboard/QuickActions";

/**
 * Page Dashboard du backoffice
 *
 * Page d'accueil après connexion qui affiche :
 * - Statistiques principales (Produits, Clients, Commandes, CA)
 * - Actions rapides vers les principales sections
 *
 * Protégée par AuthGuard (accessible uniquement si authentifié et approuvé)
 *
 * TODO: Implémenter les vraies statistiques depuis l'API
 */
const DashboardPage: React.FC = () => {
  return (
    <AuthGuard>
      <Head>
        <title>Tableau de Bord - Nature de Pierre</title>
        <meta
          name="description"
          content="Interface d'administration pour Nature de Pierre"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen">
        {/* HEADER */}
        <Header />

        {/* MAIN CONTENT */}
        <main className="main-content">
          <div className="page-container">
            <h1 className="page-title">Tableau de Bord</h1>
            <StatsOverview />
            <QuickActions />
          </div>
        </main>

        {/* FOOTER */}
        <Footer />
      </div>
    </AuthGuard>
  );
};

export default DashboardPage;
