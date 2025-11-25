import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { CustomerFilters, CustomerTable } from "./";
import ErrorAlert from "../../shared/ErrorAlert";
import PageHeader from "../../shared/PageHeader";
import Button from "../../shared/Button";
import { CustomerPublicDTO } from "../../../dto";

/** URL de l'API depuis les variables d'environnement */
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3020";

/**
 * Composant de liste des clients
 *
 * Fonctionnalités :
 * - Affichage de la liste des clients avec filtres (recherche)
 * - Navigation vers les pages de création, édition et gestion des adresses
 * - Suppression de clients
 *
 * États gérés :
 * - Liste des clients
 * - Filtres de recherche
 * - Gestion des erreurs et chargement
 */
const CustomerList: React.FC = () => {
  const router = useRouter();

  // États de données
  const [customers, setCustomers] = useState<CustomerPublicDTO[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<
    CustomerPublicDTO[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // États des filtres
  const [searchTerm, setSearchTerm] = useState("");

  // Charger les données au montage du composant
  useEffect(() => {
    loadCustomers();
  }, []);

  /**
   * Effet de filtrage des clients
   * Applique les filtres de recherche
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
   * Navigue vers la page d'édition d'un client
   * @param customer - Client à éditer
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
   * @param customer - Client dont on veut gérer les adresses
   */
  const handleManageAddresses = (customer: CustomerPublicDTO) => {
    router.push(`/customers/${customer.customerId}/addresses`);
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

      <CustomerFilters searchTerm={searchTerm} onSearchChange={setSearchTerm} />

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
    </div>
  );
};

export default CustomerList;
