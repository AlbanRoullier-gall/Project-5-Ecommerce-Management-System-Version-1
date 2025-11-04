/**
 * Routes des commandes - Configuration déclarative
 */

import { SimpleRoute } from "../core/types";

export const ORDER_ROUTES: SimpleRoute[] = [
  // Routes publiques
  { path: "/orders", method: "ALL", service: "order", auth: false },
  { path: "/orders/:id", method: "ALL", service: "order", auth: false },
  {
    path: "/orders/:orderId/items",
    method: "ALL",
    service: "order",
    auth: false,
  },
  {
    path: "/orders/:orderId/addresses",
    method: "ALL",
    service: "order",
    auth: false,
  },
  {
    path: "/customers/:customerId/credit-notes",
    method: "GET",
    service: "order",
    auth: false,
  },
  { path: "/statistics/orders", method: "GET", service: "order", auth: false },

  // Routes admin
  { path: "/admin/orders", method: "ALL", service: "order", auth: true },
  { path: "/admin/orders/:id", method: "ALL", service: "order", auth: true },
  {
    path: "/admin/orders/:id/delivery-status",
    method: "PATCH",
    service: "order",
    auth: true,
  },
  {
    path: "/admin/orders/:orderId/items",
    method: "GET",
    service: "order",
    auth: true,
  },
  {
    path: "/admin/orders/:orderId/addresses",
    method: "GET",
    service: "order",
    auth: true,
  },
  { path: "/admin/order-items", method: "ALL", service: "order", auth: true },
  {
    path: "/admin/order-items/:id",
    method: "ALL",
    service: "order",
    auth: true,
  },
  { path: "/admin/credit-notes", method: "ALL", service: "order", auth: true },
  {
    path: "/admin/credit-notes/:id",
    method: "ALL",
    service: "order",
    auth: true,
  },
  {
    path: "/admin/credit-notes/:id/status",
    method: "PATCH",
    service: "order",
    auth: true,
  },
  {
    path: "/admin/credit-note-items",
    method: "ALL",
    service: "order",
    auth: true,
  },
  {
    path: "/admin/credit-note-items/:id",
    method: "ALL",
    service: "order",
    auth: true,
  },
  {
    path: "/admin/credit-notes/:creditNoteId/items",
    method: "GET",
    service: "order",
    auth: true,
  },
  {
    path: "/admin/order-addresses",
    method: "ALL",
    service: "order",
    auth: true,
  },
  {
    path: "/admin/order-addresses/:id",
    method: "ALL",
    service: "order",
    auth: true,
  },
  {
    path: "/admin/statistics/orders",
    method: "GET",
    service: "order",
    auth: true,
  },
  {
    path: "/admin/orders/year/:year/export-data",
    method: "GET",
    service: "order",
    auth: true,
  },
];
