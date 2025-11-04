/**
 * Routes du service PDF Export - Configuration avec conventions automatiques
 */

import { Route } from "../core/types";
import { createProxyRoute } from "./helpers";

export const PDF_EXPORT_ROUTES: Route[] = [
  // Routes admin (auth automatique via convention /admin/*)
  createProxyRoute("/admin/export/orders-year", "POST", "pdf-export"),
];
