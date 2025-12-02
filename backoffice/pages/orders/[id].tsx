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
import { useAuth } from "../../contexts/AuthContext";

/**
 * Page de détail d'une commande
 *
 * Protégée par AuthGuard (accessible uniquement si authentifié et approuvé)
 */
const OrderDetailPage: React.FC = () => {
  const router = useRouter();
  const { apiCall } = useAuth();
  const { id } = router.query;
  const [order, setOrder] = useState<OrderPublicDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      try {
        const data = await apiCall<{
          data: { order: OrderPublicDTO };
          message?: string;
          timestamp?: string;
          status?: number;
        }>({
          url: `/api/admin/orders/${id}`,
          method: "GET",
          requireAuth: true,
        });
        // Format standardisé : { data: { order }, ... }
        if (!data.data || !data.data.order) {
          throw new Error("Format de réponse invalide pour la commande");
        }
        setOrder(data.data.order);
      } catch (err: any) {
        if (err.status === 404) {
          throw new Error("Commande introuvable");
        }
        throw err;
      }
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
