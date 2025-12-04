/**
 * Hook composite pour gérer la liste des clients
 * Combine useCustomers avec la logique de filtrage
 */

import { useState, useEffect, useCallback } from "react";
import { useCustomers } from "./useCustomers";

interface UseCustomerListFilters {
  searchTerm?: string;
}

interface UseCustomerListReturn {
  customers: ReturnType<typeof useCustomers>["customers"];
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

  const {
    customers,
    totalCustomers,
    isLoading,
    error,
    loadCustomers,
    handleDeleteCustomer,
    setError,
  } = useCustomers({ searchTerm: debouncedSearchTerm });

  // Debounce du filtre de recherche (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Charger les clients quand le filtre débounced change
  useEffect(() => {
    loadCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm]);

  const resetFilters = useCallback(() => {
    setSearchTerm("");
  }, []);

  return {
    customers,
    totalCustomers,
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
