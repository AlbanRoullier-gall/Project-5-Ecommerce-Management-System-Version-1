/**
 * Routes d'authentification - Configuration avec conventions automatiques
 */

import { Route } from "../core/types";
import { createProxyRoute } from "./helpers";

export const AUTH_ROUTES: Route[] = [
  // Routes publiques
  // NOTE: /auth/register, /auth/reset-password, etc. sont gérées par routes orchestrées
  createProxyRoute("/auth/login", "POST", "auth"),
  createProxyRoute("/auth/validate-password", "POST", "auth"),

  // Routes admin (auth automatique via convention /admin/*)
  createProxyRoute("/admin/auth/change-password", "PUT", "auth"),
  createProxyRoute("/admin/auth/logout", "POST", "auth"),
];
