import React, { useState, useEffect } from "react";
import CustomerFilters from "./CustomerFilters";
import CustomerTable from "./CustomerTable";
import CustomerForm from "./CustomerForm";
import AddressManagement from "./AddressManagement";
import ErrorAlert from "../product/ui/ErrorAlert";
import PageHeader from "../product/ui/PageHeader";
import Button from "../product/ui/Button";
import {
  CustomerPublicDTO,
  CustomerCreateDTO,
  CustomerUpdateDTO,
  CountryDTO,
} from "../../dto";

/** URL de l'API depuis les variables d'environnement */
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3020";

/**
 * Composant principal de gestion des clients
 *
 * Fonctionnalités :
 * - Affichage de la liste des clients avec filtres (recherche, statut)
 * - Création et édition de clients
 * - Gestion des adresses (multiple adresses par client)
 * - Activation/désactivation de clients
 * - Suppression de clients
 *
 * États gérés :
 * - Liste des clients
 * - Filtres de recherche
 * - Formulaires d'ajout/édition
 * - Gestion des erreurs et chargement
 */
const CustomerList: React.FC = () => {
  // États de données
  const [customers, setCustomers] = useState<CustomerPublicDTO[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<
    CustomerPublicDTO[]
  >([]);
  const [countries, setCountries] = useState<CountryDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // États des filtres
  const [searchTerm, setSearchTerm] = useState("");

  // États UI
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [editingCustomer, setEditingCustomer] =
    useState<CustomerPublicDTO | null>(null);
  const [showAddressManagement, setShowAddressManagement] = useState(false);
  const [selectedCustomerForAddresses, setSelectedCustomerForAddresses] =
    useState<CustomerPublicDTO | null>(null);

  // Charger les données au montage du composant
  useEffect(() => {
    loadCustomers();
    loadCountries();
  }, []);

  /**
   * Effet de filtrage des clients
   * Applique les filtres de recherche et statut
   */
  useEffect(() => {
    let filtered = [...customers];

    if (searchTerm) {
      filtered = filtered.filter(
        (c) =>
          c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (c.phoneNumber &&
            c.phoneNumber.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredCustomers(filtered);
  }, [customers, searchTerm]);

  /**
   * Récupère le token d'authentification du localStorage
   * @returns Le token JWT ou null
   */
  const getAuthToken = () => {
    return localStorage.getItem("auth_token");
  };

  /**
   * Charge la liste des clients depuis l'API
   * Gère les erreurs et met à jour l'état de chargement
   */
  const loadCustomers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = getAuthToken();

      if (!token) {
        throw new Error(
          "Token d'authentification manquant. Veuillez vous reconnecter."
        );
      }

      const response = await fetch(`${API_URL}/api/admin/customers`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || "Erreur lors du chargement des clients"
        );
      }

      const data = await response.json();
      setCustomers(data.customers || data || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors du chargement"
      );
      console.error("Error loading customers:", err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Charge la liste des pays depuis l'API
   */
  const loadCountries = async () => {
    try {
      const token = getAuthToken();

      if (!token) {
        console.error("Token manquant pour chargement des pays");
        // Fallback: définir la Belgique comme seul pays
        setCountries([{ countryId: 11, countryName: "Belgique" }]);
        return;
      }

      const response = await fetch(`${API_URL}/api/admin/customers/countries`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Erreur lors du chargement des pays");
      }

      const data = await response.json();
      const allCountries = data.countries || data || [];
      // Filtrer pour ne garder que la Belgique
      const belgiumOnly = allCountries.filter((country: any) => 
        country.countryName === "Belgique" || country.countryId === 11
      );
      setCountries(belgiumOnly.length > 0 ? belgiumOnly : [{ countryId: 11, countryName: "Belgique" }]);
    } catch (err) {
      console.error("Error loading countries:", err);
      // Fallback: définir la Belgique comme seul pays
      setCountries([{ countryId: 11, countryName: "Belgique" }]);
    }
  };

  /**
   * Crée un nouveau client
   * @param data - Données du client
   */
  const handleCreateCustomer = async (data: CustomerCreateDTO) => {
    setIsLoading(true);
    setError(null);
    try {
      const token = getAuthToken();

      const response = await fetch(`${API_URL}/api/admin/customers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || "Erreur lors de la création du client"
        );
      }

      await loadCustomers();
      setShowCustomerForm(false);
      setEditingCustomer(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors de la création"
      );
      console.error("Error creating customer:", err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Met à jour un client existant
   * @param data - Nouvelles données du client
   */
  const handleUpdateCustomer = async (data: CustomerUpdateDTO) => {
    if (!editingCustomer) return;

    setIsLoading(true);
    setError(null);
    try {
      const token = getAuthToken();

      const response = await fetch(
        `${API_URL}/api/admin/customers/${editingCustomer.customerId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || "Erreur lors de la mise à jour du client"
        );
      }

      await loadCustomers();
      setShowCustomerForm(false);
      setEditingCustomer(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors de la mise à jour"
      );
      console.error("Error updating customer:", err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Gère la soumission du formulaire (création ou mise à jour)
   * @param data - Données du client
   */
  const handleSaveCustomer = async (
    data: CustomerCreateDTO | CustomerUpdateDTO
  ) => {
    if (editingCustomer) {
      await handleUpdateCustomer(data as CustomerUpdateDTO);
    } else {
      await handleCreateCustomer(data as CustomerCreateDTO);
    }
  };

  /**
   * Supprime un client
   * @param customerId - ID du client à supprimer
   */
  const handleDeleteCustomer = async (customerId: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce client ?")) {
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      const response = await fetch(
        `${API_URL}/api/admin/customers/${customerId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || "Erreur lors de la suppression du client"
        );
      }

      await loadCustomers();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors de la suppression"
      );
      console.error("Error deleting customer:", err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Ouvre le formulaire d'édition d'un client
   * @param customer - Client à éditer
   */
  const handleEditCustomer = (customer: CustomerPublicDTO) => {
    setEditingCustomer(customer);
    setShowCustomerForm(true);
    setShowAddressManagement(false);
  };

  /**
   * Toggle l'affichage du formulaire de nouveau client
   * Ferme la gestion des adresses si on ouvre le formulaire
   */
  const handleNewCustomer = () => {
    setEditingCustomer(null);
    setShowCustomerForm(!showCustomerForm);
    if (!showCustomerForm) {
      setShowAddressManagement(false);
    }
  };

  /**
   * Ferme le formulaire de client et réinitialise l'édition
   */
  const handleCancelForm = () => {
    setShowCustomerForm(false);
    setEditingCustomer(null);
  };

  /**
   * Ouvre la gestion des adresses pour un client
   * @param customer - Client dont on veut gérer les adresses
   */
  const handleManageAddresses = (customer: CustomerPublicDTO) => {
    setSelectedCustomerForAddresses(customer);
    setShowAddressManagement(true);
    setShowCustomerForm(false);
    setEditingCustomer(null);
  };

  /**
   * Ferme la gestion des adresses
   */
  const handleCloseAddressManagement = () => {
    setShowAddressManagement(false);
    setSelectedCustomerForAddresses(null);
  };

  return (
    <div style={{ fontSize: "1rem" }}>
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

      {showCustomerForm && (
        <CustomerForm
          customer={editingCustomer}
          onSubmit={handleSaveCustomer}
          onCancel={handleCancelForm}
          isLoading={isLoading}
        />
      )}

      {showAddressManagement && selectedCustomerForAddresses && (
        <AddressManagement
          customer={selectedCustomerForAddresses}
          countries={countries}
          onClose={handleCloseAddressManagement}
        />
      )}

      {!showCustomerForm && !showAddressManagement && (
        <>
          <CustomerFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1rem",
            }}
          >
            <p
              style={{
                fontSize: "1.1rem",
                color: "#6b7280",
                fontWeight: "500",
              }}
            >
              {filteredCustomers.length} client(s) trouvé(s)
            </p>
          </div>
          <CustomerTable
            customers={filteredCustomers}
            onEdit={handleEditCustomer}
            onDelete={handleDeleteCustomer}
            onManageAddresses={handleManageAddresses}
          />
        </>
      )}
    </div>
  );
};

export default CustomerList;
