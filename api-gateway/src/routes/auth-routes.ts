/**
 * Routes d'authentification
 */

import { ServiceName } from "../config";

export const AUTH_ROUTES: Record<string, ServiceName> = {
  // Routes publiques (sans authentification)
  // Note: /auth/register, /auth/reset-password, /auth/reset-password/confirm,
  // /auth/approve-backoffice et /auth/reject-backoffice sont gérées par des handlers
  // personnalisés dans routes-handler.ts car elles nécessitent une orchestration
  // entre auth-service et email-service
  "/auth/login": "auth", // POST: Connexion utilisateur
  "/auth/validate-password": "auth", // POST: Valider mot de passe

  // Routes admin (avec authentification)
  "/admin/auth/change-password": "auth", // PUT: Changer mot de passe
  "/admin/auth/logout": "auth", // POST: Déconnexion
};
