/**
 * Utilitaires pour la gestion des erreurs
 * Centralise les patterns de gestion d'erreur
 */

/**
 * Extrait le message d'erreur d'une exception de manière standardisée
 * Gère les cas 404, 409 (conflit), erreurs réseau, etc.
 */
export function getErrorMessage(
  error: unknown,
  notFoundMessage: string = "Ressource introuvable",
  defaultMessage: string = "Erreur lors du chargement",
  conflictMessage?: string
): string {
  if (error && typeof error === "object" && "status" in error) {
    const err = error as { status?: number; message?: string; data?: any };
    if (err.status === 404) {
      return notFoundMessage;
    }
    if (err.status === 409) {
      // Pour les conflits, priorité au message personnalisé, puis data.message, puis message par défaut
      if (conflictMessage) return conflictMessage;
      if (err.data && typeof err.data === "object" && err.data.message) {
        return err.data.message;
      }
      if (err.message) return err.message;
      return conflictMessage || "Conflit détecté";
    }
  }

  if (error instanceof Error) {
    return error.message || defaultMessage;
  }

  return defaultMessage;
}

/**
 * Wrapper pour exécuter une fonction async avec gestion d'erreur standardisée
 * Retourne un tuple [result, error] pour une gestion plus simple
 */
export async function safeAsync<T>(
  asyncFn: () => Promise<T>
): Promise<[T | null, Error | null]> {
  try {
    const result = await asyncFn();
    return [result, null];
  } catch (error) {
    const err =
      error instanceof Error
        ? error
        : new Error(
            error instanceof Object && "message" in error
              ? String(error.message)
              : "Erreur inconnue"
          );
    return [null, err];
  }
}
