"use client";

import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import AuthGuard from "../../components/auth/AuthGuard";
import { CustomerForm } from "../../components/customer/customer-form-view";
import ErrorAlert from "../../components/shared/ErrorAlert";
import PageHeader from "../../components/shared/PageHeader";
import { LoadingSpinner } from "../../components/shared";
import { CustomerPublicDTO, CustomerUpdateDTO } from "../../dto";

/** URL de l'API depuis les variables d'environnement */
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3020";

/**
 * Page d'édition d'un client
 *
 * Protégée par AuthGuard (accessible uniquement si authentifié et approuvé)
 */
const EditCustomerPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [customer, setCustomer] = useState<CustomerPublicDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Récupère le token d'authentification du localStorage
   */
  const getAuthToken = () => {
    return localStorage.getItem("auth_token");
  };

  /**
   * Charge les données du client
   */
  useEffect(() => {
    if (id) {
      loadCustomer();
    }
  }, [id]);

  const loadCustomer = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = getAuthToken();

      if (!token) {
        throw new Error(
          "Token d'authentification manquant. Veuillez vous reconnecter."
        );
      }

      const response = await fetch(`${API_URL}/api/admin/customers/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Client introuvable");
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || "Erreur lors du chargement du client"
        );
      }

      const data = await response.json();
      setCustomer(data.customer || data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors du chargement"
      );
      console.error("Error loading customer:", err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Met à jour le client
   */
  const handleUpdateCustomer = async (data: CustomerUpdateDTO) => {
    if (!customer) return;

    setIsSaving(true);
    setError(null);
    try {
      const token = getAuthToken();

      const response = await fetch(`${API_URL}/api/admin/customers/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || "Erreur lors de la mise à jour du client"
        );
      }

      // Recharger les données du client
      await loadCustomer();
      // Optionnel : rediriger vers la liste
      // router.push("/customers");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors de la mise à jour"
      );
      console.error("Error updating customer:", err);
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Annule l'édition et retourne à la liste
   */
  const handleCancel = () => {
    router.push("/customers");
  };

  if (isLoading) {
    return (
      <AuthGuard>
        <Head>
          <title>Chargement... - Nature de Pierre</title>
        </Head>
        <div className="min-h-screen">
          <Header />
          <main className="main-content">
            <div className="page-container">
              <LoadingSpinner message="Chargement du client..." />
            </div>
          </main>
          <Footer />
        </div>
      </AuthGuard>
    );
  }

  if (!customer) {
    return (
      <AuthGuard>
        <Head>
          <title>Client introuvable - Nature de Pierre</title>
        </Head>
        <div className="min-h-screen">
          <Header />
          <main className="main-content">
            <div className="page-container">
              <ErrorAlert
                message="Client introuvable"
                onClose={() => router.push("/customers")}
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
        <title>Modifier le client - Nature de Pierre</title>
        <meta
          name="description"
          content="Modifier les informations d'un client"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen">
        {/* HEADER */}
        <Header />

        {/* MAIN CONTENT */}
        <main className="main-content">
          <div className="page-container">
            {error && (
              <ErrorAlert message={error} onClose={() => setError(null)} />
            )}

            <PageHeader title={`Modifier le client : ${customer.fullName}`} />

            <CustomerForm
              customer={customer}
              onSubmit={handleUpdateCustomer}
              onCancel={handleCancel}
              isLoading={isSaving}
            />
          </div>
        </main>

        {/* FOOTER */}
        <Footer />
      </div>
    </AuthGuard>
  );
};

export default EditCustomerPage;
