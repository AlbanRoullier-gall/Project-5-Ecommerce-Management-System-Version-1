"use client";

import { CustomerForm } from "../../components/customer/customer-form-view";
import { PageLayout } from "../../components/shared";
import { useCreateCustomerPage } from "../../hooks";

/**
 * Page de création d'un nouveau client
 * Orchestrateur léger - toute la logique est dans useCreateCustomerPage
 */
const NewCustomerPage: React.FC = () => {
  const { isLoading, error, handleCreateCustomer, handleCancel, setError } =
    useCreateCustomerPage();

  return (
    <PageLayout
      title="Nouveau client"
      description="Créer un nouveau client"
      error={error || undefined}
      onErrorClose={() => setError(null)}
      pageTitle="Nouveau client"
      showPageHeader={true}
    >
      <CustomerForm
        customer={null}
        onSubmit={handleCreateCustomer}
        onCancel={handleCancel}
        isLoading={isLoading}
      />
    </PageLayout>
  );
};

export default NewCustomerPage;
