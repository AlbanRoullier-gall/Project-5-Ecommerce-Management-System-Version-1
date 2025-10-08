/**
 * Routes pour le service email
 */

import { ServiceName } from "../config";

export const EMAIL_ROUTES: Record<string, ServiceName> = {
  // Routes publiques (sans authentification)
  "/email/send": "email", // POST: Envoyer email générique
  "/email/send-reset-email": "email", // POST: Envoyer email de réinitialisation
  "/email/send-welcome-email": "email", // POST: Envoyer email de bienvenue
  "/email/send-confirmation-email": "email", // POST: Envoyer email de confirmation
  "/email/send-notification": "email", // POST: Envoyer notification générale
  "/email/confirmation": "email", // POST: Envoyer confirmation

  // Routes backoffice
  "/email/backoffice-approval-request": "email", // POST: Demande d'approbation backoffice
  "/email/backoffice-approval-confirmation": "email", // POST: Confirmation d'approbation backoffice
  "/email/backoffice-rejection-notification": "email", // POST: Notification de rejet backoffice

  // Routes admin (avec authentification)
  "/admin/email/templates": "email", // GET: Lister les templates, POST: Créer template
  "/admin/email/templates/:id": "email", // GET: Détails template, PUT: Modifier, DELETE: Supprimer
  "/admin/email/send-bulk": "email", // POST: Envoi en masse
  "/admin/email/history": "email", // GET: Historique des envois
};
