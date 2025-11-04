/**
 * Routes du service client - Configuration avec conventions automatiques
 */

import { Route } from "../core/types";
import { createAdminRoutes, createProxyRoute } from "./helpers";

export const CUSTOMER_ROUTES: Route[] = [
  // Routes publiques
  createProxyRoute("/customers", "POST", "customer"),
  createProxyRoute("/customers/by-email/:email", "GET", "customer"),
  createProxyRoute("/customers/countries", "GET", "customer"),
  createProxyRoute("/customers/:id", "GET", "customer"),
  createProxyRoute("/customers/:customerId/addresses", "POST", "customer"),

  // Routes admin (auth automatique via convention /admin/*)
  ...createAdminRoutes("customer", [
    "/admin/customers",
    "/admin/customers/:id",
    "/admin/customers/:customerId/addresses",
  ]),
  createProxyRoute("/admin/customers/search", "GET", "customer"),
  createProxyRoute("/admin/customers/countries", "GET", "customer"),
  createProxyRoute(
    "/admin/customers/:customerId/addresses/:id",
    "ALL",
    "customer"
  ),
];
