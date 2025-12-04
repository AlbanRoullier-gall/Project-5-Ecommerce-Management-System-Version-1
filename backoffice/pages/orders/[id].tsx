"use client";

import { useRouter } from "next/router";
import { OrderDetailModal } from "../../components/order/order-detail-view";
import { PageLayout } from "../../components/shared";
import { useOrderDetailPage } from "../../hooks";

/**
 * Page de détail d'une commande
 * Orchestrateur léger - toute la logique est dans useOrderDetailPage
 */
const OrderDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const { order, isLoading, error, handleClose, setError } =
    useOrderDetailPage(id);

  return (
    <PageLayout
      title={
        isLoading
          ? "Chargement..."
          : order
          ? `Commande #${order.id}`
          : "Commande introuvable"
      }
      description={order ? `Détails de la commande ${order.id}` : undefined}
      error={error || undefined}
      onErrorClose={() => setError(null)}
      isLoading={isLoading}
      loadingMessage="Chargement de la commande..."
      notFound={!isLoading && !order}
      notFoundMessage={error || "Commande introuvable"}
      onNotFoundClose={() => router.push("/orders")}
    >
      {order && (
        <OrderDetailModal
          isOpen={true}
          order={order}
          isLoading={false}
          error={error}
          onClose={handleClose}
        />
      )}
    </PageLayout>
  );
};

export default OrderDetailPage;
