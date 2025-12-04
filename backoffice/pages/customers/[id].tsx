"use client";

import { useRouter } from "next/router";
import { CustomerForm } from "../../components/customer/customer-form-view";
import { PageLayout } from "../../components/shared";
import { useEditCustomerPage } from "../../hooks";

/**
 * Page d'édition d'un client
 * Orchestrateur léger - toute la logique est dans useEditCustomerPage
 */
const EditCustomerPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const {
    customer,
    isLoading,
    isSaving,
    error,
    handleUpdateCustomer,
    handleCancel,
    setError,
  } = useEditCustomerPage(id);

  const customerName = customer
    ? `${customer.firstName} ${customer.lastName}`
    : "";

  return (
    <PageLayout
      title={isLoading ? "Chargement..." : customer ? `Modifier le client : ${customerName}` : "Client introuvable"}
      description={customer ? "Modifier les informations d'un client" : undefined}
      error={error || undefined}
      onErrorClose={() => setError(null)}
      pageTitle={customer ? `Modifier le client : ${customerName}` : undefined}
      showPageHeader={!!customer}
      isLoading={isLoading}
      loadingMessage="Chargement du client..."
      notFound={!isLoading && !customer}
      notFoundMessage="Client introuvable"
      onNotFoundClose={() => router.push("/customers")}
    >
      {customer && (
        <CustomerForm
          customer={customer}
          onSubmit={handleUpdateCustomer}
          onCancel={handleCancel}
          isLoading={isSaving}
        />
      )}
    </PageLayout>
  );
};

export default EditCustomerPage;
