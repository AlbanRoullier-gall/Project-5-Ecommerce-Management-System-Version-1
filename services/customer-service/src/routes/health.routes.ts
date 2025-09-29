/**
 * Routes de santé
 * Configuration centralisée des routes de monitoring pour le Service Registry
 *
 * Architecture : Route definition pattern
 * - Routes centralisées et documentées
 * - Séparation de la définition des routes et de la logique métier
 * - Compatible avec Service Registry
 */
/**
 * RouteDefinition
 * Interface pour définir une route de manière structurée
 */
export interface RouteDefinition {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  path: string;
  handler: string; // Format: "ControllerName.methodName"
  middleware: string[]; // Noms des middlewares à appliquer
  description: string;
  authRequired: boolean;
  serviceName: string; // Nom du service pour le Service Registry
  version: string; // Version de l'API
}

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
    serviceName: "customer-service",
    version: "v1",
  },
  {
    method: "GET",
    path: "/api/health/detailed",
    handler: "HealthController.detailedHealthCheck",
    middleware: [],
    description: "Vérification détaillée de la santé du service",
    authRequired: false,
    serviceName: "customer-service",
    version: "v1",
  },
];

/**
 * Retourne toutes les routes de santé
 */
export function getHealthRoutes(): RouteDefinition[] {
  return healthRoutes;
}
