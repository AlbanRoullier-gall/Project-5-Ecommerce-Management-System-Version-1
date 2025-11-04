/**
 * Conventions automatiques pour les routes
 * Détermine automatiquement l'auth et les uploads basés sur les patterns de path
 */

import { UploadConfig } from "./types";

/**
 * Détecte si une route nécessite une authentification
 * Convention: /admin/* = auth automatique
 */
export const needsAuth = (path: string, explicitAuth?: boolean): boolean => {
  if (explicitAuth !== undefined) return explicitAuth;
  return path.includes("/admin/");
};

/**
 * Détecte si une route nécessite un upload
 * Conventions:
 * - /with-images = upload multiple (10 fichiers)
 * - POST vers /admin/products/.../images = upload multiple (5 fichiers)
 */
export const getUploadConfig = (
  path: string,
  method: string,
  explicitUpload?: UploadConfig
): UploadConfig | undefined => {
  if (explicitUpload) return explicitUpload;

  if (path.includes("/with-images")) {
    return { type: "multiple", field: "images", maxFiles: 10 };
  }

  // POST vers /admin/products/*/images (sans paramètre après /images) = upload d'images
  if (
    method === "POST" &&
    path.includes("/admin/products") &&
    path.includes("/images") &&
    !path.includes("/images/") &&
    path.split("/images").length === 2
  ) {
    return { type: "multiple", field: "images", maxFiles: 5 };
  }

  return undefined;
};

/**
 * Détermine si un chemin doit être utilisé tel quel (sans préfixe /api)
 * Convention: chemins commençant par /uploads ou /api sont déjà complets
 */
export const shouldSkipApiPrefix = (path: string): boolean => {
  return path.startsWith("/uploads") || path.startsWith("/api");
};
