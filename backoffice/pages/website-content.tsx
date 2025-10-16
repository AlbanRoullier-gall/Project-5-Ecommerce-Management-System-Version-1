"use client";

import Head from "next/head";
import Header from "../components/Header";
import Footer from "../components/Footer";
import AuthGuard from "../components/auth/AuthGuard";
import PageHeader from "../components/product/ui/PageHeader";
import Button from "../components/product/ui/Button";
import ErrorAlert from "../components/product/ui/ErrorAlert";
import WebsiteContentTable from "../components/website-content/WebsiteContentTable";
import WebsiteContentFormModal from "../components/website-content/WebsiteContentFormModal";
import { useEffect, useMemo, useState } from "react";
import { WebsitePagePublicDTO } from "../dto";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3020";

export default function WebsiteContentPage() {
  const [pages, setPages] = useState<WebsitePagePublicDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [pageToEdit, setPageToEdit] = useState<WebsitePagePublicDTO | null>(
    null
  );

  const getAuthToken = () => localStorage.getItem("auth_token");

  const loadPages = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      if (!token) throw new Error("Non authentifié");
      const res = await fetch(`${API_URL}/api/admin/website-content/pages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erreur chargement des pages");
      const json = await res.json();
      const list: WebsitePagePublicDTO[] =
        json?.data?.pages || json?.pages || (Array.isArray(json) ? json : []);
      setPages(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur lors du chargement");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPages();
  }, []);

  const filteredPages = useMemo(() => {
    if (!search) return pages;
    const term = search.toLowerCase();
    return pages.filter((p) =>
      [p.pageSlug, p.pageTitle].some((v) =>
        (v || "").toLowerCase().includes(term)
      )
    );
  }, [pages, search]);

  const handleDelete = async (page: WebsitePagePublicDTO) => {
    if (!window.confirm(`Supprimer la page "${page.pageTitle}" ?`)) return;
    try {
      const token = getAuthToken();
      if (!token) throw new Error("Non authentifié");
      const res = await fetch(
        `${API_URL}/api/admin/website-content/pages/${page.pageSlug}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("Suppression échouée");
      await loadPages();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Erreur lors de la suppression"
      );
    }
  };

  return (
    <AuthGuard>
      <Head>
        <title>Gestion du contenu - Backoffice</title>
        <meta name="description" content="Gérer le contenu texte du site" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen">
        <Header />

        <main className="main-content">
          <div className="page-container">
            {error && (
              <ErrorAlert message={error} onClose={() => setError(null)} />
            )}

            <PageHeader title="Gestion du contenu">
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input
                  placeholder="Rechercher (slug, titre)"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{
                    padding: "0.85rem 1rem",
                    borderRadius: 12,
                    border: "2px solid #e1e5e9",
                    minWidth: 320,
                  }}
                />
                <Button
                  onClick={() => {
                    setPageToEdit(null);
                    setIsFormOpen(true);
                  }}
                  variant="primary"
                  icon="fas fa-plus"
                >
                  Nouvelle page
                </Button>
                <Button
                  onClick={loadPages}
                  variant="secondary"
                  icon="fas fa-rotate"
                >
                  Actualiser
                </Button>
              </div>
            </PageHeader>

            <WebsiteContentTable
              pages={filteredPages}
              isLoading={isLoading}
              onEdit={(p) => {
                setPageToEdit(p);
                setIsFormOpen(true);
              }}
              onDelete={handleDelete}
            />
          </div>
        </main>

        <Footer />
      </div>

      <WebsiteContentFormModal
        isOpen={isFormOpen}
        pageToEdit={pageToEdit}
        onClose={() => setIsFormOpen(false)}
        onSaved={loadPages}
      />
    </AuthGuard>
  );
}
