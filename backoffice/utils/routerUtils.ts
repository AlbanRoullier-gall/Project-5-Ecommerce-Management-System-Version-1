/**
 * Utilitaires pour le router Next.js
 * Centralise les transformations courantes
 */

/**
 * Normalise un ID du router.query en nombre
 * Gère les cas où l'ID peut être string, string[], number ou undefined
 */
export function normalizeRouterId(
  id: string | string[] | number | undefined
): number | null {
  if (!id && id !== 0) return null;

  // Si c'est déjà un nombre, on le retourne
  if (typeof id === "number") {
    return isNaN(id) ? null : id;
  }

  const idString = Array.isArray(id) ? id[0] : String(id);
  if (!idString) return null;

  const parsedId = parseInt(idString, 10);
  return isNaN(parsedId) ? null : parsedId;
}
