import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { CustomerFilters, CustomerTable } from "./";
import ErrorAlert from "../../shared/ErrorAlert";
import PageHeader from "../../shared/PageHeader";
import Button from "../../shared/Button";
import { CustomerPublicDTO } from "../../../dto";
import { useAuth } from "../../../contexts/AuthContext";

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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCustomers, setTotalCustomers] = useState<number>(0);

  // États des filtres
  const [searchTerm, setSearchTerm] = useState("");

  // Charger les données au montage du composant
  useEffect(() => {
    loadCustomers();
  }, []);

  /**
   * Effet : Recharger les clients quand le terme de recherche change
   * Utilise un debounce pour éviter trop d'appels API
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      loadCustomers();
    }, 300); // Debounce de 300ms

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const { apiCall } = useAuth();

  /**
   * Charge la liste des clients depuis l'API avec filtrage côté serveur
   * Gère les erreurs et met à jour l'état de chargement
   */
  const loadCustomers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Construire les paramètres de requête avec le terme de recherche
      const queryParams = new URLSearchParams();
      if (searchTerm) {
        queryParams.set("search", searchTerm);
      }

      const response = await apiCall<{
        data: {
          customers: CustomerPublicDTO[];
          pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
            hasMore: boolean;
          };
        };
        message: string;
        timestamp: string;
        status: number;
      }>({
        url: `/api/admin/customers${
          queryParams.toString() ? `?${queryParams.toString()}` : ""
        }`,
        method: "GET",
        requireAuth: true,
      });

      // Format standardisé : { data: { customers: [], pagination: {} }, ... }
      if (!response.data || !Array.isArray(response.data.customers)) {
        throw new Error("Format de réponse invalide pour les clients");
      }

      const customersList = response.data.customers;
      const pagination = response.data.pagination;

      setCustomers(customersList);
      setTotalCustomers(pagination?.total || customersList.length);
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
      await apiCall({
        url: `/api/admin/customers/${customerId}`,
        method: "DELETE",
        requireAuth: true,
      });

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
          {totalCustomers} client(s) trouvé(s)
        </p>
      </div>
      <CustomerTable
        customers={customers}
        onEdit={handleEditCustomer}
        onDelete={handleDeleteCustomer}
        onManageAddresses={handleManageAddresses}
      />
    </div>
  );
};

export default CustomerList;
