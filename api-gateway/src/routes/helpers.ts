/**
 * Helpers pour créer des routes de manière plus simple
 * Réduit la duplication dans les fichiers de routes
 */

import { Route } from "../core/types";
import { ServiceName } from "../config";

/**
 * Crée une route proxy simple vers un service
 */
export const createProxyRoute = (
  path: string,
  method: Route["method"] = "ALL",
  service: ServiceName
): Route => ({
  path,
  method,
  service,
});

/**
 * Crée plusieurs routes proxy pour un service
 */
export const createServiceRoutes = (
  service: ServiceName,
  paths: string[],
  method: Route["method"] = "ALL"
): Route[] => {
  return paths.map((path) => createProxyRoute(path, method, service));
};

/**
 * Crée une route avec authentification automatique (admin)
 */
export const createAuthRoute = (
  path: string,
  method: Route["method"] = "ALL",
  service: ServiceName
): Route => ({
  path,
  method,
  service,
  auth: true,
});

/**
 * Crée plusieurs routes admin pour un service
 */
export const createAdminRoutes = (
  service: ServiceName,
  paths: string[],
  method: Route["method"] = "ALL"
): Route[] => {
  return paths.map((path) => createAuthRoute(path, method, service));
};

/**
 * Crée une route orchestrée avec handler custom
 */
export const createOrchestratedRoute = (
  path: string,
  method: Route["method"],
  handler: NonNullable<Route["handler"]>
): Route => ({
  path,
  method,
  handler,
});
