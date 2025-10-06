"use client";

import Head from "next/head";
import Header from "../components/Header";
import Footer from "../components/Footer";

const DashboardPage: React.FC = () => {
  return (
    <>
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

            {/* Statistiques principales */}
            <div className="stats-container">
              <div className="stat-card">
                <h3>Produits</h3>
                <p className="stat-number">0</p>
                <p className="stat-label">En catalogue</p>
              </div>

              <div className="stat-card">
                <h3>Clients</h3>
                <p className="stat-number">0</p>
                <p className="stat-label">Inscrits</p>
              </div>

              <div className="stat-card">
                <h3>Commandes</h3>
                <p className="stat-number">0</p>
                <p className="stat-label">Cette année</p>
              </div>

              <div className="stat-card">
                <h3>Chiffre d'Affaires</h3>
                <p className="stat-number">0,00 €</p>
                <p className="stat-label">Cette année</p>
              </div>
            </div>

            {/* Actions rapides */}
            <div className="quick-actions">
              <h2>Actions Rapides</h2>
              <div className="actions-grid">
                <a href="/products" className="action-card">
                  <i className="fas fa-box"></i>
                  <span>Gérer les Produits</span>
                </a>

                <a href="/customers" className="action-card">
                  <i className="fas fa-users"></i>
                  <span>Gérer les Clients</span>
                </a>

                <a href="/invoices" className="action-card">
                  <i className="fas fa-file-invoice"></i>
                  <span>Voir les Factures</span>
                </a>

                <a href="/content" className="action-card">
                  <i className="fas fa-edit"></i>
                  <span>Gérer le Contenu</span>
                </a>
              </div>
            </div>
          </div>
        </main>

        {/* FOOTER */}
        <Footer />
      </div>
    </>
  );
};

export default DashboardPage;
