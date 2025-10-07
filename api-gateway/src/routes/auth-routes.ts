/**
 * Routes d'authentification
 */

import { ServiceName } from "../config";

export const AUTH_ROUTES: Record<string, ServiceName> = {
  // Routes publiques (sans authentification)
  "/auth/register": "auth", // POST: Inscription utilisateur
  "/auth/login": "auth", // POST: Connexion utilisateur
  "/auth/validate-password": "auth", // POST: Valider mot de passe
  "/auth/reset-password": "auth", // POST: Demander réinitialisation mot de passe
  "/auth/reset-password/confirm": "auth", // POST: Confirmer réinitialisation mot de passe

  // Routes d'approbation backoffice (via email)
  "/auth/approve-backoffice": "auth", // GET: Approuver accès backoffice
  "/auth/reject-backoffice": "auth", // GET: Rejeter accès backoffice

  // Routes admin (avec authentification)
  "/admin/auth/profile": "auth", // GET: Profil utilisateur, PUT: Modifier profil
  "/admin/auth/change-password": "auth", // PUT: Changer mot de passe
  "/admin/auth/logout": "auth", // POST: Déconnexion
};
