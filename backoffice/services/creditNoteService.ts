/**
 * Service pour les avoirs (backoffice)
 * Gère tous les appels API liés aux avoirs admin
 */

import { apiClient } from "./apiClient";
import { CreditNoteItemPublicDTO } from "../dto";
import { ApiResponse } from "./apiClient";

/**
 * Calcule les totaux d'un avoir à partir des IDs d'items de commande
 */
export async function calculateCreditNoteTotals(itemIds: number[]): Promise<{
  totalHT: number;
  totalTTC: number;
  totalVAT: number;
}> {
  const response = await apiClient.post<
    ApiResponse<{
      totalHT: number;
      totalTTC: number;
      totalVAT: number;
    }>
  >("/api/admin/credit-notes/calculate-totals", {
    itemIds,
  });

  if (!response.data) {
    throw new Error("Format de réponse invalide pour le calcul des totaux");
  }

  return response.data;
}

/**
 * Récupère les articles d'un avoir
 */
export async function getCreditNoteItems(
  creditNoteId: number
): Promise<CreditNoteItemPublicDTO[]> {
  const response = await apiClient.get<
    ApiResponse<{ creditNoteItems: CreditNoteItemPublicDTO[]; count: number }>
  >(`/api/admin/credit-notes/${creditNoteId}/items`);

  if (!response.data || !Array.isArray(response.data.creditNoteItems)) {
    throw new Error("Format de réponse invalide pour les articles");
  }

  return response.data.creditNoteItems;
}
