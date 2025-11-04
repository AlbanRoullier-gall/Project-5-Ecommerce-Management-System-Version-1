/**
 * Routes des produits - Configuration déclarative
 */

import { SimpleRoute } from "../core/types";

export const PRODUCT_ROUTES: SimpleRoute[] = [
  // Routes publiques
  { path: "/products", method: "ALL", service: "product", auth: false },
  { path: "/products/:id", method: "ALL", service: "product", auth: false },
  { path: "/categories", method: "ALL", service: "product", auth: false },
  { path: "/images/:imageId", method: "ALL", service: "product", auth: false },

  // Routes admin
  { path: "/admin/products", method: "ALL", service: "product", auth: true },
  {
    path: "/admin/products/:id",
    method: "ALL",
    service: "product",
    auth: true,
  },
  {
    path: "/admin/products/:id/activate",
    method: "POST",
    service: "product",
    auth: true,
  },
  {
    path: "/admin/products/:id/deactivate",
    method: "POST",
    service: "product",
    auth: true,
  },
  {
    path: "/admin/products/with-images",
    method: "POST",
    service: "product",
    auth: true,
    upload: { type: "multiple", field: "images", maxFiles: 10 },
  },
  { path: "/admin/categories", method: "ALL", service: "product", auth: true },
  {
    path: "/admin/categories/:id",
    method: "ALL",
    service: "product",
    auth: true,
  },
  {
    path: "/admin/products/:id/images",
    method: "POST",
    service: "product",
    auth: true,
    upload: { type: "multiple", field: "images", maxFiles: 5 },
  },
  {
    path: "/admin/products/:id/images",
    method: "GET",
    service: "product",
    auth: true,
  },
  {
    path: "/admin/products/:id/images/:imageId",
    method: "DELETE",
    service: "product",
    auth: true,
  },
];
