/**
 * Utilitaires pour les opérations asynchrones
 * Centralise les patterns courants de gestion async avec loading/error
 */

import { getErrorMessage } from "./errorUtils";

/**
 * Exécute une opération async avec gestion automatique du loading et des erreurs
 * Simplifie le pattern répétitif setIsLoading(true) + setError(null) + try/catch/finally
 */
export async function executeWithLoading<T>(
  operation: () => Promise<T>,
  setIsLoading: (loading: boolean) => void,
  setError: (error: string | null) => void,
  errorMessages: {
    notFoundMessage?: string;
    defaultMessage: string;
    conflictMessage?: string;
  },
  onError?: (error: unknown) => void
): Promise<T | null> {
  setIsLoading(true);
  setError(null);

  try {
    return await operation();
  } catch (err: unknown) {
    const errorMessage = getErrorMessage(
      err,
      errorMessages.notFoundMessage || "Ressource introuvable",
      errorMessages.defaultMessage,
      errorMessages.conflictMessage
    );
    setError(errorMessage);

    if (onError) {
      onError(err);
    } else {
      console.error("Error executing operation:", err);
    }

    return null;
  } finally {
    setIsLoading(false);
  }
}
