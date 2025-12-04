/**
 * Hook personnalisé pour gérer les clients
 * Centralise la logique de récupération et de gestion des clients
 */

import { useState, useCallback } from "react";
import { CustomerPublicDTO, CustomerListRequestDTO } from "../dto";
import {
  getCustomers,
  deleteCustomer as deleteCustomerService,
} from "../services/customerService";
import { executeWithLoading } from "../utils";

interface UseCustomersFilters {
  searchTerm?: string;
}

interface UseCustomersReturn {
  customers: CustomerPublicDTO[];
  totalCustomers: number;
  isLoading: boolean;
  error: string | null;
  loadCustomers: () => Promise<void>;
  handleDeleteCustomer: (customerId: number) => Promise<void>;
  setError: (error: string | null) => void;
}

export function useCustomers(filters: UseCustomersFilters): UseCustomersReturn {
  const [customers, setCustomers] = useState<CustomerPublicDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCustomers = useCallback(async () => {
    const result = await executeWithLoading(
      async () => {
        const filtersDTO: Partial<CustomerListRequestDTO> = {};
        if (filters.searchTerm) filtersDTO.search = filters.searchTerm;
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
  }, [filters.searchTerm]);

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

  return {
    customers,
    totalCustomers: customers.length,
    isLoading,
    error,
    loadCustomers,
    handleDeleteCustomer,
    setError,
  };
}
