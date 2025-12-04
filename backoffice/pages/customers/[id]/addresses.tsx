"use client";

import { useRouter } from "next/router";
import { AddressManagement } from "../../../components/customer/address-management-view";
import { PageLayout } from "../../../components/shared";
import { useCustomerAddressesPage } from "../../../hooks";

/**
 * Page de gestion des adresses d'un client
 * Orchestrateur léger - toute la logique est dans useCustomerAddressesPage
 */
const CustomerAddressesPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const {
    customer,
    isLoading,
    error,
    handleClose,
    setError,
  } = useCustomerAddressesPage(id);

  const customerName = customer
    ? customer.fullName || `${customer.firstName} ${customer.lastName}`
    : "";

  return (
    <PageLayout
      title={isLoading ? "Chargement..." : customer ? `Adresses de ${customerName}` : "Client introuvable"}
      description={customer ? "Gérer les adresses d'un client" : undefined}
      error={error || undefined}
      onErrorClose={() => setError(null)}
      pageTitle={customer ? `Adresses de ${customerName}` : undefined}
      showPageHeader={!!customer}
      isLoading={isLoading}
      loadingMessage="Chargement du client..."
      notFound={!isLoading && !customer}
      notFoundMessage={error || "Client introuvable"}
      onNotFoundClose={() => router.push("/customers")}
    >
      {customer && (
        <AddressManagement customer={customer} onClose={handleClose} />
      )}
    </PageLayout>
  );
};

export default CustomerAddressesPage;
