/**
 * Routes du service client
 */

import { ServiceName } from "../config";

export const CUSTOMER_ROUTES: Record<string, ServiceName> = {
  // Routes publiques
  "/customers": "customer", // POST: Créer un client
  "/customers/:id": "customer", // GET: Récupérer un client spécifique
  "/customers/:customerId/addresses": "customer", // POST: Ajouter une adresse
  "/customers/:customerId/addresses/:id": "customer", // GET: Récupérer une adresse spécifique
  "/customers/:customerId/companies": "customer", // POST: Ajouter une entreprise
  "/customers/:customerId/companies/:id": "customer", // GET: Récupérer une entreprise spécifique

  // Routes admin
  "/admin/customers": "customer", // GET: Liste des clients, PUT: Mettre à jour client, DELETE: Supprimer client
  "/admin/customers/:id": "customer", // GET: Récupérer client, PUT: Modifier client, DELETE: Supprimer client
  "/admin/customers/search": "customer", // GET: Rechercher des clients
  "/admin/customers/:customerId/addresses": "customer", // GET: Liste des adresses d'un client, POST: Ajouter une adresse
  "/admin/customers/:customerId/addresses/:id": "customer", // PUT: Modifier adresse, DELETE: Supprimer adresse
  "/admin/customers/:customerId/companies": "customer", // GET: Liste des entreprises d'un client, POST: Ajouter une entreprise
  "/admin/customers/:customerId/companies/:id": "customer", // PUT: Modifier entreprise, DELETE: Supprimer entreprise
};
