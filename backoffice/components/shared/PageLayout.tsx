import React from "react";
import Head from "next/head";
import Header from "../Header";
import Footer from "../Footer";
import AuthGuard from "../auth/AuthGuard";
import ErrorAlert from "./ErrorAlert";
import PageHeader from "./PageHeader";
import LoadingSpinner from "./LoadingSpinner";

interface PageLayoutProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  error?: string | null;
  onErrorClose?: () => void;
  pageTitle?: string;
  isLoading?: boolean;
  loadingMessage?: string;
  showPageHeader?: boolean;
  notFound?: boolean;
  notFoundMessage?: string;
  onNotFoundClose?: () => void;
}

/**
 * Layout de page standardisé
 * Encapsule la structure commune : Header, Footer, AuthGuard, Head, ErrorAlert
 */
const PageLayout: React.FC<PageLayoutProps> = ({
  title,
  description,
  children,
  error,
  onErrorClose,
  pageTitle,
  isLoading = false,
  loadingMessage = "Chargement...",
  showPageHeader = false,
  notFound = false,
  notFoundMessage = "Ressource introuvable",
  onNotFoundClose,
}) => {
  if (isLoading) {
    return (
      <AuthGuard>
        <Head>
          <title>{loadingMessage} - Nature de Pierre</title>
        </Head>
        <div className="min-h-screen">
          <Header />
          <main className="main-content">
            <div className="page-container">
              <LoadingSpinner message={loadingMessage} />
            </div>
          </main>
          <Footer />
        </div>
      </AuthGuard>
    );
  }

  if (notFound) {
    return (
      <AuthGuard>
        <Head>
          <title>{title} - Nature de Pierre</title>
        </Head>
        <div className="min-h-screen">
          <Header />
          <main className="main-content">
            <div className="page-container">
              <ErrorAlert
                message={notFoundMessage}
                onClose={onNotFoundClose || (() => {})}
              />
            </div>
          </main>
          <Footer />
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <Head>
        <title>{title} - Nature de Pierre</title>
        {description && <meta name="description" content={description} />}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen">
        <Header />

        <main className="main-content">
          <div className="page-container">
            {error && (
              <ErrorAlert
                message={error}
                onClose={onErrorClose || (() => {})}
              />
            )}

            {showPageHeader && pageTitle && <PageHeader title={pageTitle} />}

            {children}
          </div>
        </main>

        <Footer />
      </div>
    </AuthGuard>
  );
};

export default PageLayout;
