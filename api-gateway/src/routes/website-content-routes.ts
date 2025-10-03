/**
 * Routes du service contenu du site
 */

import { ServiceName } from "../config";

export const WEBSITE_CONTENT_ROUTES: Record<string, ServiceName> = {
  // Routes publiques
  "/website-content/pages": "website-content", // GET: Lister toutes les pages
  "/website-content/pages/:slug": "website-content", // GET: Récupérer une page par slug
  "/website-content/slugs": "website-content", // GET: Récupérer tous les slugs
  "/content": "website-content", // GET: Récupérer contenu du site

  // Routes admin
  "/admin/website-content/pages": "website-content", // GET: Liste pages, POST: Créer page
  "/admin/website-content/pages/:slug": "website-content", // GET: Récupérer page, PUT: Modifier page, DELETE: Supprimer page
  "/admin/website-content/pages/:slug/versions": "website-content", // GET: Lister les versions d'une page
  "/admin/website-content/pages/:slug/rollback": "website-content", // POST: Restaurer une version
  "/admin/website-content/pages/:slug/versions/:versionNumber": "website-content", // DELETE: Supprimer une version
  "/admin/content": "website-content", // GET: Liste contenu, POST: Créer contenu, PUT: Modifier contenu, DELETE: Supprimer contenu
};
