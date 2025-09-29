/**
 * Routes d'authentification
 * Configuration centralisée des routes d'authentification pour le Service Registry
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
 * Routes d'authentification
 * Configuration centralisée des routes d'authentification
 */
export const authRoutes: RouteDefinition[] = [
  {
    method: "POST",
    path: "/api/auth/register",
    handler: "AuthController.register",
    middleware: ["validateRequest", "registerSchema"],
    description: "Inscription d'un nouvel utilisateur",
    authRequired: false,
    serviceName: "auth-service",
    version: "v1",
  },
  {
    method: "POST",
    path: "/api/auth/login",
    handler: "AuthController.login",
    middleware: ["validateRequest", "loginSchema"],
    description: "Connexion d'un utilisateur",
    authRequired: false,
    serviceName: "auth-service",
    version: "v1",
  },
  {
    method: "GET",
    path: "/api/auth/profile",
    handler: "AuthController.getProfile",
    middleware: ["authenticateToken"],
    description: "Récupération du profil utilisateur",
    authRequired: true,
    serviceName: "auth-service",
    version: "v1",
  },
  {
    method: "PUT",
    path: "/api/auth/profile",
    handler: "AuthController.updateProfile",
    middleware: ["authenticateToken", "validateRequest", "updateProfileSchema"],
    description: "Mise à jour du profil utilisateur",
    authRequired: true,
    serviceName: "auth-service",
    version: "v1",
  },
  {
    method: "PUT",
    path: "/api/auth/change-password",
    handler: "AuthController.changePassword",
    middleware: [
      "authenticateToken",
      "validateRequest",
      "changePasswordSchema",
    ],
    description: "Changement de mot de passe",
    authRequired: true,
    serviceName: "auth-service",
    version: "v1",
  },
  {
    method: "POST",
    path: "/api/auth/logout",
    handler: "AuthController.logout",
    middleware: ["authenticateToken"],
    description: "Déconnexion de l'utilisateur",
    authRequired: true,
    serviceName: "auth-service",
    version: "v1",
  },
];

/**
 * Retourne toutes les routes d'authentification
 */
export function getAuthRoutes(): RouteDefinition[] {
  return authRoutes;
}

/**
 * Retourne les routes d'authentification publiques (sans authentification requise)
 */
export function getPublicAuthRoutes(): RouteDefinition[] {
  return authRoutes.filter((route) => !route.authRequired);
}

/**
 * Retourne les routes d'authentification protégées (authentification requise)
 */
export function getProtectedAuthRoutes(): RouteDefinition[] {
  return authRoutes.filter((route) => route.authRequired);
}
