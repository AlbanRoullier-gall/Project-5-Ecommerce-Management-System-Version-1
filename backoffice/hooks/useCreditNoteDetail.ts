/**
 * Hook pour gérer les détails d'un avoir
 * Centralise la logique de récupération des items d'un avoir
 */

import { useState, useEffect } from "react";
import { CreditNoteItemPublicDTO } from "../dto";
import { getCreditNoteItems } from "../services/creditNoteService";
import { executeWithLoading } from "../utils";

interface UseCreditNoteDetailReturn {
  items: CreditNoteItemPublicDTO[];
  itemsLoading: boolean;
  itemsError: string | null;
}

export function useCreditNoteDetail(
  creditNoteId: number | null
): UseCreditNoteDetailReturn {
  const [items, setItems] = useState<CreditNoteItemPublicDTO[]>([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [itemsError, setItemsError] = useState<string | null>(null);

  useEffect(() => {
    const loadItems = async () => {
      if (!creditNoteId) {
        setItems([]);
        return;
      }

      setItems([]);

      const itemsList = await executeWithLoading(
        async () => await getCreditNoteItems(creditNoteId),
        setItemsLoading,
        setItemsError,
        {
          defaultMessage: "Erreur chargement des articles d'avoir",
        }
      );

      if (itemsList) {
        setItems(itemsList);
      }
    };

    loadItems();
  }, [creditNoteId]);

  return {
    items,
    itemsLoading,
    itemsError,
  };
}
