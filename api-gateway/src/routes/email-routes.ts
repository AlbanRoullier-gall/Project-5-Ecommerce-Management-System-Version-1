/**
 * Routes pour le service email - Configuration avec conventions automatiques
 */

import { Route } from "../core/types";
import { createServiceRoutes } from "./helpers";

export const EMAIL_ROUTES: Route[] = [
  // Routes publiques (toutes en POST)
  ...createServiceRoutes(
    "email",
    [
      "/email/send",
      "/email/send-reset-email",
      "/email/confirmation",
      "/email/backoffice-approval-request",
      "/email/backoffice-approval-confirmation",
      "/email/backoffice-rejection-notification",
      "/email/order-confirmation",
    ],
    "POST"
  ),
];
