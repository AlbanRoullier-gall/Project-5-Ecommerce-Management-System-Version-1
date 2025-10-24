"use client";

import Head from "next/head";
import Header from "../components/Header";
import Footer from "../components/Footer";
import AuthGuard from "../components/auth/AuthGuard";
import ExportForm from "../components/accounting/ExportForm";
import { useRouter } from "next/router";

/**
 * Page Export Comptable du backoffice
 *
 * Page pour exporter les données comptables d'une année :
 * - Sélection du format (PDF, Excel, CSV)
 * - Options d'export
 * - Téléchargement des fichiers
 *
 * Protégée par AuthGuard (accessible uniquement si authentifié et approuvé)
 */
const AccountingExportPage: React.FC = () => {
  const router = useRouter();
  const { year } = router.query;
  const yearNumber = year ? parseInt(year as string) : new Date().getFullYear();

  return (
    <AuthGuard>
      <Head>
        <title>Export {yearNumber} - Nature de Pierre</title>
        <meta
          name="description"
          content={`Export comptable ${yearNumber} pour Nature de Pierre`}
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen">
        {/* HEADER */}
        <Header />

        {/* MAIN CONTENT */}
        <main className="main-content">
          <div className="page-container">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="page-title">Export Comptable {yearNumber}</h1>
                <p className="text-gray-600">
                  Exportez vos données comptables pour impression et archivage
                </p>
              </div>
              <button
                onClick={() => router.back()}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                ← Retour
              </button>
            </div>

            {/* Formulaire d'export */}
            <ExportForm year={yearNumber} />
          </div>
        </main>

        {/* FOOTER */}
        <Footer />
      </div>
    </AuthGuard>
  );
};

export default AccountingExportPage;
