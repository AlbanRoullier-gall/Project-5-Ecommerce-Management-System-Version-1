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
  "/customers/civilities": "customer", // GET: Liste des civilités (public)
  "/customers/categories": "customer", // GET: Liste des catégories (public)
  "/customers/countries": "customer", // GET: Liste des pays (public)

  // Routes avec paramètres (doivent être en dernier)
  "/customers/:id": "customer", // GET: Récupérer un client spécifique
  "/customers/:customerId/addresses": "customer", // POST: Ajouter une adresse
  "/customers/:customerId/addresses/:id": "customer", // GET: Récupérer une adresse spécifique
  "/customers/:customerId/companies": "customer", // POST: Ajouter une entreprise
  "/customers/:customerId/companies/:id": "customer", // GET: Récupérer une entreprise spécifique

  // ===== ROUTES ADMIN =====
  // IMPORTANT: Les routes spécifiques DOIVENT être avant les routes avec paramètres (:id)

  // Routes spécifiques
  "/admin/customers": "customer", // GET: Liste des clients, PUT: Mettre à jour client, DELETE: Supprimer client
  "/admin/customers/search": "customer", // GET: Rechercher des clients
  "/admin/customers/civilities": "customer", // GET: Liste des civilités (admin)
  "/admin/customers/categories": "customer", // GET: Liste des catégories socio-professionnelles (admin)
  "/admin/customers/countries": "customer", // GET: Liste des pays (admin)

  // Routes génériques avec paramètres (en dernier)
  "/admin/customers/:id": "customer", // GET: Récupérer client, PUT: Modifier client, DELETE: Supprimer client
  "/admin/customers/:customerId/addresses": "customer", // GET: Liste des adresses d'un client, POST: Ajouter une adresse
  "/admin/customers/:customerId/addresses/:id": "customer", // PUT: Modifier adresse, DELETE: Supprimer adresse
  "/admin/customers/:customerId/companies": "customer", // GET: Liste des entreprises d'un client, POST: Ajouter une entreprise
  "/admin/customers/:customerId/companies/:id": "customer", // PUT: Modifier entreprise, DELETE: Supprimer entreprise
};
