/**
 * Hook pour gérer la liste des clients avec filtres intégrés
 * Combine la logique de récupération et de filtrage UI
 */

import { useState, useEffect, useCallback } from "react";
import { CustomerPublicDTO, CustomerListRequestDTO } from "dto";
import {
  getCustomers,
  deleteCustomer as deleteCustomerService,
} from "../../services/customerService";
import { executeWithLoading } from "../../utils";

interface UseCustomerListFilters {
  searchTerm?: string;
}

interface UseCustomerListReturn {
  customers: CustomerPublicDTO[];
  totalCustomers: number;
  isLoading: boolean;
  error: string | null;
  loadCustomers: () => Promise<void>;
  handleDeleteCustomer: (customerId: number) => Promise<void>;
  setError: (error: string | null) => void;

  // Filters (UI state)
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  resetFilters: () => void;
}

export function useCustomerList(
  initialFilters: UseCustomerListFilters = {}
): UseCustomerListReturn {
  const [searchTerm, setSearchTerm] = useState(initialFilters.searchTerm || "");

  // Filtres débounced pour les appels API
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(
    initialFilters.searchTerm || ""
  );

  const [customers, setCustomers] = useState<CustomerPublicDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounce du filtre de recherche (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const loadCustomers = useCallback(async () => {
    const result = await executeWithLoading(
      async () => {
        const filtersDTO: Partial<CustomerListRequestDTO> = {};
        if (debouncedSearchTerm) filtersDTO.search = debouncedSearchTerm;
        return await getCustomers(filtersDTO);
      },
      setIsLoading,
      setError,
      {
        notFoundMessage: "Clients introuvables",
        defaultMessage: "Erreur lors du chargement",
      },
      (err) => console.error("Error loading customers:", err)
    );

    if (result) {
      setCustomers(result.customers);
    }
  }, [debouncedSearchTerm]);

  // Charger les clients quand le filtre débounced change
  useEffect(() => {
    loadCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm]);

  const handleDeleteCustomer = useCallback(
    async (customerId: number) => {
      await executeWithLoading(
        async () => {
          await deleteCustomerService(customerId);
          await loadCustomers();
        },
        setIsLoading,
        setError,
        {
          notFoundMessage: "Client introuvable",
          defaultMessage: "Erreur lors de la suppression",
        },
        (err) => {
          console.error("Error deleting customer:", err);
          throw err;
        }
      );
    },
    [loadCustomers]
  );

  const resetFilters = useCallback(() => {
    setSearchTerm("");
  }, []);

  return {
    customers,
    totalCustomers: customers.length,
    isLoading,
    error,
    loadCustomers,
    handleDeleteCustomer,
    setError,

    // Filters
    searchTerm,
    setSearchTerm,
    resetFilters,
  };
}

