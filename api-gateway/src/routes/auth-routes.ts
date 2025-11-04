/**
 * Routes d'authentification - Configuration déclarative
 */

import { SimpleRoute } from "../core/types";

export const AUTH_ROUTES: SimpleRoute[] = [
  // Routes publiques
  // NOTE: /auth/register, /auth/reset-password, /auth/reset-password/confirm,
  // /auth/approve-backoffice et /auth/reject-backoffice sont gérées par des handlers
  // personnalisés dans routes/orchestrated/index.ts car elles nécessitent une orchestration
  // entre auth-service et email-service
  { path: "/auth/login", method: "POST", service: "auth", auth: false },
  {
    path: "/auth/validate-password",
    method: "POST",
    service: "auth",
    auth: false,
  },

  // Routes admin (avec authentification)
  {
    path: "/admin/auth/change-password",
    method: "PUT",
    service: "auth",
    auth: true,
  },
  { path: "/admin/auth/logout", method: "POST", service: "auth", auth: true },
];
