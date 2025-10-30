/**
 * Routes du service paiement
 */

import { ServiceName } from "../config";

export const PAYMENT_ROUTES: Record<string, ServiceName> = {
  // Routes publiques
  "/payment/create": "payment", // POST: Créer un paiement Stripe
};
