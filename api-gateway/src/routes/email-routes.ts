/**
 * Routes pour le service email
 */

import { ServiceName } from "../config";

export const EMAIL_ROUTES: Record<string, ServiceName> = {
  // Routes publiques (sans authentification)
  "/email/send": "email", // POST: Envoyer email générique
  "/email/send-reset-email": "email", // POST: Envoyer email de réinitialisation
  "/email/confirmation": "email", // POST: Envoyer confirmation

  // Routes backoffice
  "/email/backoffice-approval-request": "email", // POST: Demande d'approbation backoffice
  "/email/backoffice-approval-confirmation": "email", // POST: Confirmation d'approbation backoffice
  "/email/backoffice-rejection-notification": "email", // POST: Notification de rejet backoffice

  // Routes commandes
  "/email/order-confirmation": "email", // POST: Envoyer email de confirmation de commande
};
