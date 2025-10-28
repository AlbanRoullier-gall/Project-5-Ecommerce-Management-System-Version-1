/**
 * Routes du service panier
 */

import { ServiceName } from "../config";

export const CART_ROUTES: Record<string, ServiceName> = {
  // Routes publiques
  "/cart": "cart", // GET: Récupérer panier, POST: Créer panier, DELETE: Vider panier
  "/cart/items": "cart", // POST: Ajouter article au panier
  "/cart/items/:productId": "cart", // PUT: Modifier quantité, DELETE: Supprimer article
  // NOTE: /cart/checkout géré directement par l'API Gateway
};
