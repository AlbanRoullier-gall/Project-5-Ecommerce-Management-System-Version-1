/**
 * Routes du service panier - Configuration avec conventions automatiques
 */

import { Route } from "../core/types";
import { createProxyRoute } from "./helpers";

export const CART_ROUTES: Route[] = [
  // Routes publiques
  createProxyRoute("/cart", "ALL", "cart"),
  createProxyRoute("/cart/items", "POST", "cart"),
  createProxyRoute("/cart/items/:productId", "ALL", "cart"),
  // NOTE: /cart/checkout géré directement par l'API Gateway dans routes orchestrées
];
