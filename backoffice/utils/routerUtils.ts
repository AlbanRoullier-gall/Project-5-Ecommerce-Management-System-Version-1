/**
 * Utilitaires pour le router Next.js
 * Centralise les transformations courantes
 */

import { NextRouter } from "next/router";

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

/**
 * Redirige vers une route en tenant compte du basePath
 * Fonctionne correctement en développement et en production
 * 
 * Next.js router.push() devrait normalement gérer le basePath automatiquement,
 * mais cette fonction garantit que cela fonctionne même si le basePath
 * n'est pas correctement configuré au build time.
 * 
 * @param router - Instance du router Next.js
 * @param path - Chemin de destination (ex: "/products", "/customers")
 */
export function pushWithBasePath(router: NextRouter, path: string): void {
  // Utiliser le basePath du router si disponible (c'est la source de vérité)
  const basePath = router.basePath || "";
  
  // Construire le chemin complet avec le basePath
  // Si le path commence déjà par le basePath, ne pas le dupliquer
  let fullPath = path;
  
  if (basePath && !path.startsWith(basePath)) {
    // Ajouter le basePath seulement si le path ne le contient pas déjà
    fullPath = `${basePath}${path}`;
  }
  
  // Utiliser router.push() qui devrait normalement gérer le basePath automatiquement
  // Mais on passe le chemin complet pour être sûr
  router.push(fullPath);
}
