"use client";

import { useRouter } from "next/router";
import { CustomerForm } from "../../components/customer/customer-form-view";
import { PageLayout } from "../../components/shared";
import { useCustomerFormPage } from "../../hooks";
import { pushWithBasePath } from "../../utils";

/**
 * Page d'édition d'un client
 * Orchestrateur léger - toute la logique est dans useCustomerFormPage
 */
const EditCustomerPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const {
    customer,
    isLoading,
    isSaving,
    error,
    handleSaveCustomer,
    handleCancel,
    setError,
  } = useCustomerFormPage(id);

  const customerName = customer
    ? `${customer.firstName} ${customer.lastName}`
    : "";

  return (
    <PageLayout
      title={
        isLoading
          ? "Chargement..."
          : customer
          ? `Modifier le client : ${customerName}`
          : "Client introuvable"
      }
      description={
        customer ? "Modifier les informations d'un client" : undefined
      }
      error={error || undefined}
      onErrorClose={() => setError(null)}
      pageTitle={customer ? `Modifier le client : ${customerName}` : undefined}
      showPageHeader={!!customer}
      isLoading={isLoading}
      loadingMessage="Chargement du client..."
      notFound={!isLoading && !customer}
      notFoundMessage="Client introuvable"
      onNotFoundClose={() => pushWithBasePath(router, "/customers")}
    >
      {customer && (
        <CustomerForm
          customer={customer}
          onSubmit={handleSaveCustomer}
          onCancel={handleCancel}
          isLoading={isSaving}
        />
      )}
    </PageLayout>
  );
};

export default EditCustomerPage;
