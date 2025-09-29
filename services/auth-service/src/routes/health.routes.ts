/**
 * Routes de santé
 * Configuration centralisée des routes de monitoring pour le Service Registry
 *
 * Architecture : Route definition pattern
 * - Routes centralisées et documentées
 * - Séparation de la définition des routes et de la logique métier
 * - Compatible avec Service Registry
 */
import { RouteDefinition } from "./auth.routes";

/**
 * Routes de santé
 * Configuration centralisée des routes de monitoring
 */
export const healthRoutes: RouteDefinition[] = [
  {
    method: "GET",
    path: "/api/health",
    handler: "HealthController.healthCheck",
    middleware: [],
    description: "Vérification de la santé du service",
    authRequired: false,
    serviceName: "auth-service",
    version: "v1",
  },
  {
    method: "GET",
    path: "/api/health/detailed",
    handler: "HealthController.detailedHealthCheck",
    middleware: [],
    description: "Vérification détaillée de la santé du service",
    authRequired: false,
    serviceName: "auth-service",
    version: "v1",
  },
];

/**
 * Retourne toutes les routes de santé
 */
export function getHealthRoutes(): RouteDefinition[] {
  return healthRoutes;
}
