/**
 * Hook personnalisé pour gérer les avoirs
 * Centralise la logique de récupération et de gestion des avoirs
 */

import { useState, useCallback } from "react";
import {
  CreditNotePublicDTO,
  CreditNoteListRequestDTO,
  OrderUpdateCreditNoteStatusDTO,
} from "../dto";
import {
  getCreditNotes as getCreditNotesService,
  getCreditNote as getCreditNoteService,
  updateCreditNoteStatus as updateCreditNoteStatusService,
  deleteCreditNote as deleteCreditNoteService,
} from "../services/orderService";
import { executeWithLoading, getErrorMessage } from "../utils";

interface UseCreditNotesFilters {
  yearFilter?: string;
}

interface UseCreditNotesReturn {
  creditNotes: CreditNotePublicDTO[];
  isLoading: boolean;
  error: string | null;
  loadCreditNotes: () => Promise<void>;
  loadCreditNote: (creditNoteId: number) => Promise<CreditNotePublicDTO>;
  toggleStatus: (
    creditNoteId: number,
    newStatus: "pending" | "refunded"
  ) => Promise<void>;
  deleteCreditNote: (creditNoteId: number) => Promise<void>;
  setError: (error: string | null) => void;
}

export function useCreditNotes(
  filters: UseCreditNotesFilters
): UseCreditNotesReturn {
  const [creditNotes, setCreditNotes] = useState<CreditNotePublicDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCreditNotes = useCallback(async () => {
    const result = await executeWithLoading(
      async () => {
        const filtersDTO: Partial<CreditNoteListRequestDTO> = {};
        if (filters.yearFilter && filters.yearFilter !== "")
          filtersDTO.year = parseInt(filters.yearFilter);
        return await getCreditNotesService(filtersDTO);
      },
      setIsLoading,
      setError,
      {
        notFoundMessage: "Avoirs introuvables",
        defaultMessage: "Erreur lors du chargement",
      },
      (err) => console.error("Error loading credit notes:", err)
    );

    if (result) {
      setCreditNotes(result.creditNotes);
    }
  }, [filters.yearFilter]);

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
      setError(errorMessage);
      console.error("Error loading credit note:", err);
      throw err;
    }
  }, []);

  const toggleStatus = useCallback(
    async (creditNoteId: number, newStatus: "pending" | "refunded") => {
      try {
        // Mise à jour optimiste
        setCreditNotes((prevCreditNotes) =>
          prevCreditNotes.map((cn) =>
            cn.id === creditNoteId ? { ...cn, status: newStatus } : cn
          )
        );

        const updateDTO: OrderUpdateCreditNoteStatusDTO = {
          status: newStatus,
        };

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
        setError(errorMessage);
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
        setError(errorMessage);
        console.error("Error deleting credit note:", err);
        throw err;
      }
    },
    [loadCreditNotes]
  );

  return {
    creditNotes,
    isLoading,
    error,
    loadCreditNotes,
    loadCreditNote,
    toggleStatus,
    deleteCreditNote,
    setError,
  };
}
