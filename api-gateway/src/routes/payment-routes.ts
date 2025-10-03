/**
 * Routes du service paiement
 */

import { ServiceName } from "../config";

export const PAYMENT_ROUTES: Record<string, ServiceName> = {
  // Routes publiques
  "/payment/create": "payment", // POST: Créer un paiement Stripe
  "/payment/confirm": "payment", // POST: Confirmer un paiement
  "/payment/:paymentId": "payment", // GET: Récupérer un paiement par ID

  // Routes admin
  "/admin/payment/refund": "payment", // POST: Rembourser un paiement (admin)
  "/admin/payment/stats": "payment", // GET: Statistiques de paiement (admin)
};
