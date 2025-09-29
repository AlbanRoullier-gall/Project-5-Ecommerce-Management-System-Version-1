/**
 * Index des Routes
 * Export centralisé de toutes les routes du service pour le Service Registry
 *
 * Architecture : Route aggregation pattern
 * - Export centralisé de toutes les routes
 * - Maintenance facilitée
 * - Compatible avec Service Registry
 */

import {
  RouteDefinition,
  authRoutes,
  getPublicAuthRoutes,
  getProtectedAuthRoutes,
} from "./auth.routes";
import { healthRoutes, getHealthRoutes } from "./health.routes";

// Export des routes individuelles
export {
  authRoutes,
  getPublicAuthRoutes,
  getProtectedAuthRoutes,
} from "./auth.routes";
export { healthRoutes, getHealthRoutes } from "./health.routes";

// Export du type RouteDefinition
export type { RouteDefinition } from "./auth.routes";

/**
 * Toutes les routes du service
 */
export const allRoutes: RouteDefinition[] = [...authRoutes, ...healthRoutes];

/**
 * Routes publiques (sans authentification)
 */
export const publicRoutes: RouteDefinition[] = [
  ...getPublicAuthRoutes(),
  ...getHealthRoutes(),
];

/**
 * Routes protégées (avec authentification)
 */
export const protectedRoutes: RouteDefinition[] = [...getProtectedAuthRoutes()];

/**
 * Retourne toutes les routes
 */
export function getAllRoutes(): RouteDefinition[] {
  return allRoutes;
}

/**
 * Retourne les routes par méthode HTTP
 */
export function getRoutesByMethod(method: string): RouteDefinition[] {
  return allRoutes.filter((route) => route.method === method);
}

/**
 * Retourne les routes par chemin
 */
export function getRoutesByPath(path: string): RouteDefinition[] {
  return allRoutes.filter((route) => route.path === path);
}

/**
 * Retourne les routes par handler (Controller.method)
 */
export function getRoutesByHandler(handler: string): RouteDefinition[] {
  return allRoutes.filter((route) => route.handler === handler);
}

/**
 * Retourne les routes par service
 */
export function getRoutesByService(serviceName: string): RouteDefinition[] {
  return allRoutes.filter((route) => route.serviceName === serviceName);
}

/**
 * Retourne les routes par version
 */
export function getRoutesByVersion(version: string): RouteDefinition[] {
  return allRoutes.filter((route) => route.version === version);
}

/**
 * Retourne les informations du service
 */
export function getServiceInfo() {
  return {
    serviceName: "auth-service",
    version: "v1",
    description: "Service d'authentification et de gestion des utilisateurs",
    totalRoutes: allRoutes.length,
    publicRoutes: publicRoutes.length,
    protectedRoutes: protectedRoutes.length,
    endpoints: allRoutes.map((route) => ({
      method: route.method,
      path: route.path,
      description: route.description,
      authRequired: route.authRequired,
    })),
  };
}
