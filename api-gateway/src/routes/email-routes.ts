/**
 * Routes pour le service email - Configuration déclarative
 */

import { SimpleRoute } from "../core/types";

export const EMAIL_ROUTES: SimpleRoute[] = [
  // Routes publiques
  { path: "/email/send", method: "POST", service: "email", auth: false },
  {
    path: "/email/send-reset-email",
    method: "POST",
    service: "email",
    auth: false,
  },
  {
    path: "/email/confirmation",
    method: "POST",
    service: "email",
    auth: false,
  },

  // Routes backoffice
  {
    path: "/email/backoffice-approval-request",
    method: "POST",
    service: "email",
    auth: false,
  },
  {
    path: "/email/backoffice-approval-confirmation",
    method: "POST",
    service: "email",
    auth: false,
  },
  {
    path: "/email/backoffice-rejection-notification",
    method: "POST",
    service: "email",
    auth: false,
  },

  // Routes commandes
  {
    path: "/email/order-confirmation",
    method: "POST",
    service: "email",
    auth: false,
  },
];
