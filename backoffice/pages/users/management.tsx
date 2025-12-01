"use client";

import Head from "next/head";
import { useState } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import AuthGuard from "../../components/auth/AuthGuard";
import { UserList } from "../../components/user";
import PageHeader from "../../components/shared/PageHeader";
import Button from "../../components/shared/Button";

/**
 * Page de gestion des utilisateurs
 *
 * Permet au super admin de :
 * - Voir les utilisateurs en attente d'approbation
 * - Approuver ou rejeter des utilisateurs
 * - Voir tous les utilisateurs
 * - Supprimer des utilisateurs
 *
 * Protégée par AuthGuard (accessible uniquement si authentifié)
 * Note: La vérification super admin est gérée par l'API Gateway
 */
const UserManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"pending" | "all">("pending");

  return (
    <AuthGuard>
      <Head>
        <title>Gestion des Utilisateurs - Nature de Pierre</title>
        <meta
          name="description"
          content="Gestion des utilisateurs du backoffice"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen">
        {/* HEADER */}
        <Header />

        {/* MAIN CONTENT */}
        <main className="main-content">
          <div className="page-container">
            <PageHeader title="Gestion des utilisateurs">
              <Button
                onClick={() => setActiveTab("pending")}
                variant={activeTab === "pending" ? "primary" : "secondary"}
                icon="fas fa-clock"
              >
                En attente
              </Button>
              <Button
                onClick={() => setActiveTab("all")}
                variant={activeTab === "all" ? "primary" : "secondary"}
                icon="fas fa-users"
              >
                Tous les utilisateurs
              </Button>
            </PageHeader>

            {/* Conteneur principal avec design cohérent */}
            <div
              style={{
                background: "white",
                borderRadius: "16px",
                padding: "2rem",
                marginBottom: "2rem",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                border: "2px solid rgba(19, 104, 106, 0.1)",
              }}
            >
              {/* Contenu selon l'onglet actif */}
              <UserList mode={activeTab} />
            </div>
          </div>
        </main>

        {/* FOOTER */}
        <Footer />
      </div>
    </AuthGuard>
  );
};

export default UserManagementPage;
