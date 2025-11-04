/**
 * Routes des commandes - Configuration avec conventions automatiques
 */

import { Route } from "../core/types";
import {
  createServiceRoutes,
  createAdminRoutes,
  createProxyRoute,
} from "./helpers";

export const ORDER_ROUTES: Route[] = [
  // Routes publiques
  ...createServiceRoutes("order", [
    "/orders",
    "/orders/:id",
    "/orders/:orderId/items",
    "/orders/:orderId/addresses",
  ]),
  createProxyRoute("/customers/:customerId/credit-notes", "GET", "order"),
  createProxyRoute("/statistics/orders", "GET", "order"),

  // Routes admin (auth automatique via convention /admin/*)
  ...createAdminRoutes("order", [
    "/admin/orders",
    "/admin/orders/:id",
    "/admin/order-items",
    "/admin/order-items/:id",
    "/admin/credit-notes",
    "/admin/credit-notes/:id",
    "/admin/credit-note-items",
    "/admin/credit-note-items/:id",
    "/admin/order-addresses",
    "/admin/order-addresses/:id",
  ]),

  // Routes admin avec méthodes spécifiques
  createProxyRoute("/admin/orders/:id/delivery-status", "PATCH", "order"),
  createProxyRoute("/admin/orders/:orderId/items", "GET", "order"),
  createProxyRoute("/admin/orders/:orderId/addresses", "GET", "order"),
  createProxyRoute("/admin/credit-notes/:id/status", "PATCH", "order"),
  createProxyRoute("/admin/credit-notes/:creditNoteId/items", "GET", "order"),
  createProxyRoute("/admin/statistics/orders", "GET", "order"),
  createProxyRoute("/admin/orders/year/:year/export-data", "GET", "order"),
];
