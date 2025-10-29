/**
 * Routes du service PDF Export
 */

import { ServiceName } from "../config";

export const PDF_EXPORT_ROUTES: Record<string, ServiceName> = {
  // Routes admin
  "/admin/export/orders-year": "pdf-export", // POST: Export des commandes par année
};
