/**
 * Routes du service PDF Export - Configuration déclarative
 */

import { SimpleRoute } from "../core/types";

export const PDF_EXPORT_ROUTES: SimpleRoute[] = [
  // Routes admin
  {
    path: "/admin/export/orders-year",
    method: "POST",
    service: "pdf-export",
    auth: true,
  },
];
