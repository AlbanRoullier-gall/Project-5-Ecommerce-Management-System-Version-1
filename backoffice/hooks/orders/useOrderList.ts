/**
 * Hook pour gérer la liste des commandes avec filtres intégrés
 * Combine useOrders et useCreditNotes avec la logique d'export et de filtrage
 */

import { useState, useEffect, useCallback } from "react";
import {
  OrderPublicDTO,
  OrderListRequestDTO,
  CreditNotePublicDTO,
  CreditNoteListRequestDTO,
} from "dto";
import {
  getOrders,
  updateDeliveryStatus as updateDeliveryStatusService,
  exportOrdersYear,
  getCreditNotes as getCreditNotesService,
  getCreditNote as getCreditNoteService,
  updateCreditNoteStatus as updateCreditNoteStatusService,
  deleteCreditNote as deleteCreditNoteService,
} from "../../services/orderService";
import { executeWithLoading, getErrorMessage } from "../../utils";

interface UseOrderListFilters {
  search?: string;
  deliveryFilter?: string;
  yearFilter?: string;
  totalFilter?: string;
  dateFilter?: string;
}

interface UseOrderListReturn {
  // Orders
  orders: OrderPublicDTO[];
  ordersLoading: boolean;
  ordersError: string | null;
  loadOrders: () => Promise<void>;
  toggleDeliveryStatus: (orderId: number, delivered: boolean) => Promise<void>;
  setOrdersError: (error: string | null) => void;

  // Credit Notes
  creditNotes: CreditNotePublicDTO[];
  creditNotesLoading: boolean;
  creditNotesError: string | null;
  loadCreditNotes: () => Promise<void>;
  loadCreditNote: (creditNoteId: number) => Promise<CreditNotePublicDTO>;
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

  const [orders, setOrders] = useState<OrderPublicDTO[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  const [creditNotes, setCreditNotes] = useState<CreditNotePublicDTO[]>([]);
  const [creditNotesLoading, setCreditNotesLoading] = useState(false);
  const [creditNotesError, setCreditNotesError] = useState<string | null>(null);

  const [isExporting, setIsExporting] = useState(false);

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

  const loadOrders = useCallback(async () => {
    const result = await executeWithLoading(
      async () => {
        const filtersDTO: Partial<OrderListRequestDTO> = {};
        if (debouncedFilters.search)
          filtersDTO.search = debouncedFilters.search;
        if (debouncedFilters.yearFilter && debouncedFilters.yearFilter !== "")
          filtersDTO.year = parseInt(debouncedFilters.yearFilter);
        if (debouncedFilters.totalFilter && debouncedFilters.totalFilter !== "")
          filtersDTO.total = parseFloat(debouncedFilters.totalFilter);
        if (debouncedFilters.dateFilter && debouncedFilters.dateFilter !== "")
          filtersDTO.date = debouncedFilters.dateFilter;
        if (
          debouncedFilters.deliveryFilter &&
          debouncedFilters.deliveryFilter !== ""
        )
          filtersDTO.delivered =
            debouncedFilters.deliveryFilter === "delivered";

        return await getOrders(filtersDTO);
      },
      setOrdersLoading,
      setOrdersError,
      {
        notFoundMessage: "Commandes introuvables",
        defaultMessage: "Erreur lors du chargement",
      },
      (err) => console.error("Error loading orders:", err)
    );

    if (result) {
      setOrders(result.orders);
    }
  }, [
    debouncedFilters.search,
    debouncedFilters.deliveryFilter,
    debouncedFilters.yearFilter,
    debouncedFilters.totalFilter,
    debouncedFilters.dateFilter,
  ]);

  const loadCreditNotes = useCallback(async () => {
    const result = await executeWithLoading(
      async () => {
        const filtersDTO: Partial<CreditNoteListRequestDTO> = {};
        if (debouncedFilters.yearFilter && debouncedFilters.yearFilter !== "")
          filtersDTO.year = parseInt(debouncedFilters.yearFilter);
        return await getCreditNotesService(filtersDTO);
      },
      setCreditNotesLoading,
      setCreditNotesError,
      {
        notFoundMessage: "Avoirs introuvables",
        defaultMessage: "Erreur lors du chargement",
      },
      (err) => console.error("Error loading credit notes:", err)
    );

    if (result) {
      setCreditNotes(result.creditNotes);
    }
  }, [debouncedFilters.yearFilter]);

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

  const toggleDeliveryStatus = useCallback(
    async (orderId: number, delivered: boolean) => {
      try {
        await updateDeliveryStatusService(orderId, delivered);
        // Mettre à jour l'état local
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === orderId ? { ...order, delivered } : order
          )
        );
      } catch (err: unknown) {
        const errorMessage = getErrorMessage(
          err,
          "Commande introuvable",
          "Erreur lors de la mise à jour"
        );
        setOrdersError(errorMessage);
        console.error("Error toggling delivery status:", err);
        throw err;
      }
    },
    []
  );

  const loadCreditNote = useCallback(async (creditNoteId: number) => {
    try {
      const creditNote = await getCreditNoteService(creditNoteId);
      return creditNote;
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(
        err,
        "Avoir introuvable",
        "Erreur lors du chargement"
      );
      setCreditNotesError(errorMessage);
      console.error("Error loading credit note:", err);
      throw err;
    }
  }, []);

  const toggleCreditNoteStatus = useCallback(
    async (creditNoteId: number, newStatus: "pending" | "refunded") => {
      try {
        // Mise à jour optimiste
        setCreditNotes((prevCreditNotes) =>
          prevCreditNotes.map((cn) =>
            cn.id === creditNoteId ? { ...cn, status: newStatus } : cn
          )
        );

        await updateCreditNoteStatusService(creditNoteId, newStatus);
        // Recharger pour s'assurer de la cohérence
        await loadCreditNotes();
      } catch (err: unknown) {
        // Revenir à l'état précédent en cas d'erreur
        setCreditNotes((prevCreditNotes) =>
          prevCreditNotes.map((cn) =>
            cn.id === creditNoteId
              ? {
                  ...cn,
                  status: newStatus === "refunded" ? "pending" : "refunded",
                }
              : cn
          )
        );
        const errorMessage = getErrorMessage(
          err,
          "Avoir introuvable",
          "Erreur lors de la mise à jour"
        );
        setCreditNotesError(errorMessage);
        console.error("Error toggling credit note status:", err);
        throw err;
      }
    },
    [loadCreditNotes]
  );

  const deleteCreditNote = useCallback(
    async (creditNoteId: number) => {
      try {
        await deleteCreditNoteService(creditNoteId);
        await loadCreditNotes();
      } catch (err: unknown) {
        const errorMessage = getErrorMessage(
          err,
          "Avoir introuvable",
          "Erreur lors de la suppression"
        );
        setCreditNotesError(errorMessage);
        console.error("Error deleting credit note:", err);
        throw err;
      }
    },
    [loadCreditNotes]
  );

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
