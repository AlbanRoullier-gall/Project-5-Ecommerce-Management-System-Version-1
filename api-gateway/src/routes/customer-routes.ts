/**
 * Routes du service client - Configuration déclarative
 */

import { SimpleRoute } from "../core/types";

export const CUSTOMER_ROUTES: SimpleRoute[] = [
  // Routes publiques
  { path: "/customers", method: "POST", service: "customer", auth: false },
  {
    path: "/customers/by-email/:email",
    method: "GET",
    service: "customer",
    auth: false,
  },
  {
    path: "/customers/countries",
    method: "GET",
    service: "customer",
    auth: false,
  },
  { path: "/customers/:id", method: "GET", service: "customer", auth: false },
  {
    path: "/customers/:customerId/addresses",
    method: "POST",
    service: "customer",
    auth: false,
  },

  // Routes admin
  { path: "/admin/customers", method: "ALL", service: "customer", auth: true },
  {
    path: "/admin/customers/search",
    method: "GET",
    service: "customer",
    auth: true,
  },
  {
    path: "/admin/customers/countries",
    method: "GET",
    service: "customer",
    auth: true,
  },
  {
    path: "/admin/customers/:id",
    method: "ALL",
    service: "customer",
    auth: true,
  },
  {
    path: "/admin/customers/:customerId/addresses",
    method: "ALL",
    service: "customer",
    auth: true,
  },
  {
    path: "/admin/customers/:customerId/addresses/:id",
    method: "ALL",
    service: "customer",
    auth: true,
  },
];
