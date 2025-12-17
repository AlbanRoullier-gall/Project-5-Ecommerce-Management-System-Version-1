import React from "react";
import { useRouter } from "next/router";
import { CustomerFilters, CustomerTable } from "./";
import ErrorAlert from "../../shared/ErrorAlert";
import PageHeader from "../../shared/PageHeader";
import Button from "../../shared/Button";
import { CustomerPublicDTO } from "dto";
import { useCustomerList } from "../../../hooks";
import styles from "../../../styles/components/CustomerList.module.css";

/**
 * Composant d'affichage de la liste des clients
 * Toute la logique métier est gérée par le hook useCustomerList
 */
const CustomerList: React.FC = () => {
  const router = useRouter();
  const {
    customers,
    totalCustomers,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    handleDeleteCustomer,
    setError,
  } = useCustomerList();

  /**
   * Navigue vers la page d'édition d'un client
   */
  const handleEditCustomer = (customer: CustomerPublicDTO) => {
    router.push(`/customers/${customer.customerId}`);
  };

  /**
   * Navigue vers la page de création d'un client
   */
  const handleNewCustomer = () => {
    router.push("/customers/new");
  };

  /**
   * Navigue vers la page de gestion des adresses d'un client
   */
  const handleManageAddresses = (customer: CustomerPublicDTO) => {
    router.push(`/customers/${customer.customerId}/addresses`);
  };

  /**
   * Gère la suppression d'un client avec confirmation
   */
  const handleDelete = async (customerId: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce client ?")) {
      return;
    }
    try {
      await handleDeleteCustomer(customerId);
    } catch (error) {
      console.error("Error deleting customer:", error);
    }
  };

  return (
    <div className={styles.wrapper}>
      {error && <ErrorAlert message={error} onClose={() => setError(null)} />}

      <PageHeader title="Clients">
        <Button
          onClick={handleNewCustomer}
          variant="primary"
          icon="fas fa-plus"
        >
          Nouveau client
        </Button>
      </PageHeader>

      <CustomerFilters searchTerm={searchTerm} onSearchChange={setSearchTerm} />

      <div className={styles.summaryBar}>
        <p className={styles.summaryText}>
          {totalCustomers} client(s) trouvé(s)
        </p>
      </div>
      <CustomerTable
        customers={customers}
        onEdit={handleEditCustomer}
        onDelete={handleDelete}
        onManageAddresses={handleManageAddresses}
      />
    </div>
  );
};

export default CustomerList;
