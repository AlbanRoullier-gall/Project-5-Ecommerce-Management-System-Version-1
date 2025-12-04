/**
 * Hook composite pour gérer la liste des commandes
 * Combine useOrders et useCreditNotes avec la logique d'export et de filtrage
 */

import { useState, useEffect, useCallback } from "react";
import { useOrders } from "./useOrders";
import { useCreditNotes } from "./useCreditNotes";
import { exportOrdersYear } from "../services/orderService";
import { executeWithLoading } from "../utils";

interface UseOrderListFilters {
  search?: string;
  deliveryFilter?: string;
  yearFilter?: string;
  totalFilter?: string;
  dateFilter?: string;
}

interface UseOrderListReturn {
  // Orders
  orders: ReturnType<typeof useOrders>["orders"];
  ordersLoading: boolean;
  ordersError: string | null;
  loadOrders: () => Promise<void>;
  toggleDeliveryStatus: (orderId: number, delivered: boolean) => Promise<void>;
  setOrdersError: (error: string | null) => void;

  // Credit Notes
  creditNotes: ReturnType<typeof useCreditNotes>["creditNotes"];
  creditNotesLoading: boolean;
  creditNotesError: string | null;
  loadCreditNotes: () => Promise<void>;
  loadCreditNote: (
    creditNoteId: number
  ) => Promise<ReturnType<typeof useCreditNotes>["creditNotes"][0]>;
  toggleCreditNoteStatus: (
    creditNoteId: number,
    newStatus: "pending" | "refunded"
  ) => Promise<void>;
  deleteCreditNote: (creditNoteId: number) => Promise<void>;
  setCreditNotesError: (error: string | null) => void;

  // Export
  isExporting: boolean;
  handleExportPDF: () => Promise<void>;

  // Filters (UI state)
  search: string;
  deliveryFilter: string;
  yearFilter: string;
  totalFilter: string;
  dateFilter: string;
  setSearch: (value: string) => void;
  setDeliveryFilter: (value: string) => void;
  setYearFilter: (value: string) => void;
  setTotalFilter: (value: string) => void;
  setDateFilter: (value: string) => void;
  resetFilters: () => void;
}

export function useOrderList(
  initialFilters: UseOrderListFilters = {}
): UseOrderListReturn {
  // États UI pour les filtres
  const [search, setSearch] = useState(initialFilters.search || "");
  const [deliveryFilter, setDeliveryFilter] = useState(
    initialFilters.deliveryFilter || ""
  );
  const [yearFilter, setYearFilter] = useState(initialFilters.yearFilter || "");
  const [totalFilter, setTotalFilter] = useState(
    initialFilters.totalFilter || ""
  );
  const [dateFilter, setDateFilter] = useState(initialFilters.dateFilter || "");

  // Filtres débounced pour les appels API
  const [debouncedFilters, setDebouncedFilters] =
    useState<UseOrderListFilters>(initialFilters);

  const [isExporting, setIsExporting] = useState(false);

  // Hooks pour les commandes et avoirs
  const {
    orders,
    isLoading: ordersLoading,
    error: ordersError,
    loadOrders,
    toggleDeliveryStatus,
    setError: setOrdersError,
  } = useOrders(debouncedFilters);

  const {
    creditNotes,
    isLoading: creditNotesLoading,
    error: creditNotesError,
    loadCreditNotes,
    loadCreditNote,
    toggleStatus: toggleCreditNoteStatus,
    deleteCreditNote,
    setError: setCreditNotesError,
  } = useCreditNotes({ yearFilter: debouncedFilters.yearFilter });

  // Debounce des filtres search et totalFilter (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters({
        search: search || undefined,
        deliveryFilter: deliveryFilter || undefined,
        yearFilter: yearFilter || undefined,
        totalFilter: totalFilter || undefined,
        dateFilter: dateFilter || undefined,
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [search, totalFilter]);

  // Mise à jour immédiate pour les autres filtres
  useEffect(() => {
    setDebouncedFilters((prev) => ({
      ...prev,
      deliveryFilter: deliveryFilter || undefined,
      yearFilter: yearFilter || undefined,
      dateFilter: dateFilter || undefined,
    }));
  }, [deliveryFilter, yearFilter, dateFilter]);

  // Charger les données quand les filtres débounced changent
  useEffect(() => {
    loadOrders();
    loadCreditNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    debouncedFilters.search,
    debouncedFilters.deliveryFilter,
    debouncedFilters.yearFilter,
    debouncedFilters.totalFilter,
    debouncedFilters.dateFilter,
  ]);

  const handleExportPDF = useCallback(async () => {
    if (!yearFilter) {
      alert("Veuillez sélectionner une année pour l'export");
      return;
    }

    const blob = await executeWithLoading(
      async () => await exportOrdersYear(parseInt(yearFilter)),
      setIsExporting,
      () => {}, // Pas d'affichage d'erreur (utilise alert)
      {
        defaultMessage: "Erreur lors de l'export du fichier",
      },
      (error) => {
        console.error("Export error:", error);
        alert("Erreur lors de l'export du fichier");
      }
    );

    if (blob) {
      // Créer un blob et télécharger le fichier
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `export-commandes-${yearFilter}.html`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }
  }, [yearFilter]);

  const resetFilters = useCallback(() => {
    setSearch("");
    setDeliveryFilter("");
    setYearFilter("");
    setTotalFilter("");
    setDateFilter("");
  }, []);

  return {
    // Orders
    orders,
    ordersLoading,
    ordersError,
    loadOrders,
    toggleDeliveryStatus,
    setOrdersError,

    // Credit Notes
    creditNotes,
    creditNotesLoading,
    creditNotesError,
    loadCreditNotes,
    loadCreditNote,
    toggleCreditNoteStatus,
    deleteCreditNote,
    setCreditNotesError,

    // Export
    isExporting,
    handleExportPDF,

    // Filters
    search,
    deliveryFilter,
    yearFilter,
    totalFilter,
    dateFilter,
    setSearch,
    setDeliveryFilter,
    setYearFilter,
    setTotalFilter,
    setDateFilter,
    resetFilters,
  };
}
