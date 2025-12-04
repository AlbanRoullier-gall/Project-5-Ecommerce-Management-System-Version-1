"use client";

import { CustomerForm } from "../../components/customer/customer-form-view";
import { PageLayout } from "../../components/shared";
import { useCustomerFormPage } from "../../hooks";

/**
 * Page de création d'un nouveau client
 * Orchestrateur léger - toute la logique est dans useCustomerFormPage
 */
const NewCustomerPage: React.FC = () => {
  const {
    isSaving: isLoading,
    error,
    handleSaveCustomer,
    handleCancel,
    setError,
  } = useCustomerFormPage();

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
        onSubmit={handleSaveCustomer}
        onCancel={handleCancel}
        isLoading={isLoading}
      />
    </PageLayout>
  );
};

export default NewCustomerPage;
