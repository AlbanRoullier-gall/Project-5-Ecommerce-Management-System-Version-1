/**
 * Routes des autres services
 */

import { ServiceName } from "../config";

export const OTHER_ROUTES: Record<string, ServiceName> = {
  // === CART SERVICE ===
  "/cart": "cart", // GET: Récupérer panier, POST: Créer panier, DELETE: Vider panier
  "/cart/items": "cart", // POST: Ajouter article au panier
  "/cart/items/:productId": "cart", // PUT: Modifier quantité, DELETE: Supprimer article
  "/cart/validate": "cart", // GET: Valider le panier
  "/cart/stats": "cart", // GET: Statistiques des paniers

  // === CUSTOMER SERVICE ===
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
  "/admin/customers/:customerId/addresses": "customer", // GET: Liste des adresses d'un client
  "/admin/customers/:customerId/addresses/:id": "customer", // PUT: Modifier adresse, DELETE: Supprimer adresse
  "/admin/customers/:customerId/companies": "customer", // GET: Liste des entreprises d'un client
  "/admin/customers/:customerId/companies/:id": "customer", // PUT: Modifier entreprise, DELETE: Supprimer entreprise

  // === PAYMENT SERVICE ===
  "/payment/create": "payment", // POST: Créer un paiement Stripe
  "/payment/confirm": "payment", // POST: Confirmer un paiement
  "/payment/:paymentId": "payment", // GET: Récupérer un paiement par ID
  "/admin/payment/refund": "payment", // POST: Rembourser un paiement (admin)
  "/admin/payment/stats": "payment", // GET: Statistiques de paiement (admin)

  // === EMAIL SERVICE ===
  "/email/send": "email", // POST: Envoyer un email au client
  "/email/confirmation": "email", // POST: Envoyer confirmation à l'admin

  // === WEBSITE CONTENT SERVICE ===
  // Routes publiques
  "/website-content/pages": "website-content", // GET: Lister toutes les pages
  "/website-content/pages/:slug": "website-content", // GET: Récupérer une page par slug
  "/website-content/slugs": "website-content", // GET: Récupérer tous les slugs
  "/content": "website-content", // GET: Récupérer contenu du site

  // Routes admin
  "/admin/website-content/pages": "website-content", // GET: Liste pages, POST: Créer page
  "/admin/website-content/pages/:slug": "website-content", // GET: Récupérer page, PUT: Modifier page, DELETE: Supprimer page
  "/admin/website-content/pages/:slug/versions": "website-content", // GET: Lister les versions d'une page
  "/admin/website-content/pages/:slug/rollback": "website-content", // POST: Restaurer une version
  "/admin/website-content/pages/:slug/versions/:versionNumber": "website-content", // DELETE: Supprimer une version
  "/admin/content": "website-content", // GET: Liste contenu, POST: Créer contenu, PUT: Modifier contenu, DELETE: Supprimer contenu
};
