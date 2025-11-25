"use client";

import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import AuthGuard from "../../../components/auth/AuthGuard";
import { AddressManagement } from "../../../components/customer/address-management-view";
import ErrorAlert from "../../../components/shared/ErrorAlert";
import PageHeader from "../../../components/shared/PageHeader";
import { LoadingSpinner } from "../../../components/shared";
import { CustomerPublicDTO } from "../../../dto";

/** URL de l'API depuis les variables d'environnement */
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3020";

/**
 * Page de gestion des adresses d'un client
 *
 * Protégée par AuthGuard (accessible uniquement si authentifié et approuvé)
 */
const CustomerAddressesPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [customer, setCustomer] = useState<CustomerPublicDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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
   * Ferme la gestion des adresses et retourne à la liste
   */
  const handleClose = () => {
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
        <title>Adresses de {customer.fullName} - Nature de Pierre</title>
        <meta name="description" content="Gérer les adresses d'un client" />
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

            <PageHeader title={`Adresses de ${customer.fullName}`} />

            <AddressManagement customer={customer} onClose={handleClose} />
          </div>
        </main>

        {/* FOOTER */}
        <Footer />
      </div>
    </AuthGuard>
  );
};

export default CustomerAddressesPage;
