/**
 * Routes du service client
 */

import { ServiceName } from "../config";

export const CUSTOMER_ROUTES: Record<string, ServiceName> = {
  // ===== ROUTES PUBLIQUES =====
  // IMPORTANT: Les routes spécifiques DOIVENT être avant les routes avec paramètres (:id)

  // Routes spécifiques avec chemins fixes
  "/customers": "customer", // POST: Créer un client, GET: Liste des clients (redirige vers admin)
  "/customers/by-email/:email": "customer", // GET: Récupérer un client par email
  "/customers/countries": "customer", // GET: Liste des pays (public)

  // Routes avec paramètres (doivent être en dernier)
  "/customers/:id": "customer", // GET: Récupérer un client spécifique
  "/customers/:customerId/addresses": "customer", // POST: Ajouter une adresse

  // ===== ROUTES ADMIN =====
  // IMPORTANT: Les routes spécifiques DOIVENT être avant les routes avec paramètres (:id)

  // Routes spécifiques
  "/admin/customers": "customer", // GET: Liste des clients, PUT: Mettre à jour client, DELETE: Supprimer client
  "/admin/customers/search": "customer", // GET: Rechercher des clients
  "/admin/customers/countries": "customer", // GET: Liste des pays (admin)

  // Routes génériques avec paramètres (en dernier)
  "/admin/customers/:id": "customer", // GET: Récupérer client, PUT: Modifier client, DELETE: Supprimer client
  "/admin/customers/:customerId/addresses": "customer", // GET: Liste des adresses d'un client, POST: Ajouter une adresse
  "/admin/customers/:customerId/addresses/:id": "customer", // PUT: Modifier adresse, DELETE: Supprimer adresse
};
