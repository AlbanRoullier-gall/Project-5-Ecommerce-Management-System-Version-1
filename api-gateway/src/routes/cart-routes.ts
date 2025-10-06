/**
 * Routes du service panier
 */

import { ServiceName } from "../config";

export const CART_ROUTES: Record<string, ServiceName> = {
  // Routes publiques
  "/cart": "cart", // GET: Récupérer panier, POST: Créer panier, DELETE: Vider panier
  "/cart/items": "cart", // POST: Ajouter article au panier
  "/cart/items/:productId": "cart", // PUT: Modifier quantité, DELETE: Supprimer article
  "/cart/validate": "cart", // GET: Valider le panier
  "/cart/stats": "cart", // GET: Statistiques des paniers
};
