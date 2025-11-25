"use client";

import { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import AuthGuard from "../../components/auth/AuthGuard";
import { CustomerForm } from "../../components/customer/customer-form-view";
import ErrorAlert from "../../components/shared/ErrorAlert";
import PageHeader from "../../components/shared/PageHeader";
import { CustomerCreateDTO, CustomerUpdateDTO } from "../../dto";

/** URL de l'API depuis les variables d'environnement */
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3020";

/**
 * Page de création d'un nouveau client
 *
 * Protégée par AuthGuard (accessible uniquement si authentifié et approuvé)
 */
const NewCustomerPage: React.FC = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Récupère le token d'authentification du localStorage
   */
  const getAuthToken = () => {
    return localStorage.getItem("auth_token");
  };

  /**
   * Crée un nouveau client
   */
  const handleCreateCustomer = async (
    data: CustomerCreateDTO | CustomerUpdateDTO
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const token = getAuthToken();

      if (!token) {
        throw new Error(
          "Token d'authentification manquant. Veuillez vous reconnecter."
        );
      }

      // En mode création, on s'assure que tous les champs requis sont présents
      const createData = data as CustomerCreateDTO;

      const response = await fetch(`${API_URL}/api/admin/customers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(createData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || "Erreur lors de la création du client"
        );
      }

      // Rediriger vers la liste des clients après création
      router.push("/customers");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors de la création"
      );
      console.error("Error creating customer:", err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Annule la création et retourne à la liste
   */
  const handleCancel = () => {
    router.push("/customers");
  };

  return (
    <AuthGuard>
      <Head>
        <title>Nouveau client - Nature de Pierre</title>
        <meta name="description" content="Créer un nouveau client" />
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

            <PageHeader title="Nouveau client" />

            <CustomerForm
              customer={null}
              onSubmit={handleCreateCustomer}
              onCancel={handleCancel}
              isLoading={isLoading}
            />
          </div>
        </main>

        {/* FOOTER */}
        <Footer />
      </div>
    </AuthGuard>
  );
};

export default NewCustomerPage;
