/**
 * Service pour les paiements
 * Gère la finalisation des paiements
 */

import { apiClient } from "./apiClient";

/**
 * Finalise un paiement après retour de Stripe
 */
export async function finalizePayment(
  sessionId: string
): Promise<{ success: boolean; message?: string }> {
  const response = await apiClient.post<{
    success: boolean;
    message?: string;
  }>("/api/payment/finalize", {
    csid: sessionId,
  });

  return response;
}
