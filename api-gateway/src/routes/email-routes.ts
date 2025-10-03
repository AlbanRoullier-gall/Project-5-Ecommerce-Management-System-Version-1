/**
 * Routes du service email
 */

import { ServiceName } from "../config";

export const EMAIL_ROUTES: Record<string, ServiceName> = {
  // Routes publiques
  "/email/send": "email", // POST: Envoyer un email au client
  "/email/confirmation": "email", // POST: Envoyer confirmation à l'admin
};
