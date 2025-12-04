"use client";

import { OrderList } from "../../components/order/order-list-view";
import { PageLayout } from "../../components/shared";

/**
 * Page de liste des commandes et avoirs
 * Affiche la liste des commandes avec filtres et actions
 */
const OrdersPage: React.FC = () => {
  return (
    <PageLayout
      title="Commandes"
      description="Gérer les commandes et avoirs"
    >
      <OrderList />
    </PageLayout>
  );
};

export default OrdersPage;
