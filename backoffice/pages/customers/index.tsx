"use client";

import { CustomerList } from "../../components/customer/customer-list-view";
import { PageLayout } from "../../components/shared";

/**
 * Page de liste des clients
 * Affiche la liste des clients avec filtres et actions
 */
const CustomersPage: React.FC = () => {
  return (
    <PageLayout
      title="Clients"
      description="Gérer les clients"
    >
      <CustomerList />
    </PageLayout>
  );
};

export default CustomersPage;
