/**
 * Routes des commandes
 */

import { ServiceName } from "../config";

export const ORDER_ROUTES: Record<string, ServiceName> = {
  // Routes publiques
  "/orders": "order", // POST: Créer commande, GET: Récupérer commandes client
  "/orders/:id": "order", // GET: Récupérer une commande spécifique
  "/orders/:orderId/items": "order", // GET: Récupérer articles d'une commande
  "/orders/:orderId/addresses": "order", // GET: Récupérer adresses d'une commande
  "/customers/:customerId/credit-notes": "order", // GET: Récupérer avoirs d'un client
  "/customers/:customerId/statistics/orders": "order", // GET: Statistiques d'un client
  "/statistics/orders": "order", // GET: Statistiques générales des commandes
  "/statistics/orders/date-range/:startDate/:endDate": "order", // GET: Statistiques par période

  // Routes admin
  "/admin/orders": "order", // GET: Liste toutes les commandes, PUT: Modifier commande, DELETE: Supprimer commande
  "/admin/orders/:id": "order", // GET: Voir commande admin, PUT: Modifier commande admin, DELETE: Supprimer commande admin
  "/admin/orders/:id/delivery-status": "order", // PATCH: Mettre à jour l'état de livraison
  "/admin/orders/:orderId/items": "order", // GET: Articles d'une commande (admin)
  "/admin/orders/:orderId/addresses": "order", // GET: Adresses d'une commande (admin)
  "/admin/order-items": "order", // POST: Créer article de commande
  "/admin/order-items/:id": "order", // GET: Voir article, PUT: Modifier article, DELETE: Supprimer article
  "/admin/credit-notes": "order", // POST: Créer avoir, GET: Liste avoirs
  "/admin/credit-notes/:id": "order", // GET: Voir avoir, PUT: Modifier avoir, DELETE: Supprimer avoir
  "/admin/credit-note-items": "order", // POST: Créer article d'avoir
  "/admin/credit-note-items/:id": "order", // GET: Voir article avoir, PUT: Modifier article avoir, DELETE: Supprimer article avoir
  "/admin/credit-notes/:creditNoteId/items": "order", // GET: Articles d'un avoir
  "/admin/order-addresses": "order", // POST: Créer adresse de commande
  "/admin/order-addresses/:id": "order", // GET: Voir adresse, PUT: Modifier adresse, DELETE: Supprimer adresse
  "/admin/statistics/orders": "order", // GET: Statistiques admin des commandes
  "/admin/customers/:customerId/statistics/orders": "order", // GET: Statistiques commandes d'un client
  "/admin/orders/year/:year/export-data": "order", // GET: Données d'export par année
};
