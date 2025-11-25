"use client";

import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import AuthGuard from "../../components/auth/AuthGuard";
import { OrderDetailModal } from "../../components/order/order-detail-view";
import ErrorAlert from "../../components/shared/ErrorAlert";
import { LoadingSpinner } from "../../components/shared";
import { OrderPublicDTO } from "../../dto";

/** URL de l'API depuis les variables d'environnement */
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3020";

/**
 * Page de détail d'une commande
 *
 * Protégée par AuthGuard (accessible uniquement si authentifié et approuvé)
 */
const OrderDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [order, setOrder] = useState<OrderPublicDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Récupère le token d'authentification du localStorage
   */
  const getAuthToken = () => {
    return localStorage.getItem("auth_token");
  };

  /**
   * Charge les données de la commande
   */
  useEffect(() => {
    if (id) {
      loadOrder();
    }
  }, [id]);

  const loadOrder = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = getAuthToken();

      if (!token) {
        throw new Error(
          "Token d'authentification manquant. Veuillez vous reconnecter."
        );
      }

      const response = await fetch(`${API_URL}/api/admin/orders/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Commande introuvable");
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || "Erreur lors du chargement de la commande"
        );
      }

      const data = await response.json();
      setOrder(data.order || data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors du chargement"
      );
      console.error("Error loading order:", err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Ferme la page et retourne à la liste
   */
  const handleClose = () => {
    router.push("/orders");
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
              <LoadingSpinner message="Chargement de la commande..." />
            </div>
          </main>
          <Footer />
        </div>
      </AuthGuard>
    );
  }

  if (!order) {
    return (
      <AuthGuard>
        <Head>
          <title>Commande introuvable - Nature de Pierre</title>
        </Head>
        <div className="min-h-screen">
          <Header />
          <main className="main-content">
            <div className="page-container">
              <ErrorAlert
                message="Commande introuvable"
                onClose={() => router.push("/orders")}
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
        <title>Commande #{order.id} - Nature de Pierre</title>
        <meta
          name="description"
          content={`Détails de la commande ${order.id}`}
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen">
        <Header />

        <main className="main-content">
          <div className="page-container">
            {error && (
              <ErrorAlert message={error} onClose={() => setError(null)} />
            )}

            <OrderDetailModal
              isOpen={true}
              order={order}
              isLoading={false}
              error={error}
              onClose={handleClose}
            />
          </div>
        </main>

        <Footer />
      </div>
    </AuthGuard>
  );
};

export default OrderDetailPage;
