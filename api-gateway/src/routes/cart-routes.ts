/**
 * Routes du service panier - Configuration déclarative
 */

import { SimpleRoute } from "../core/types";

export const CART_ROUTES: SimpleRoute[] = [
  // Routes publiques
  { path: "/cart", method: "ALL", service: "cart", auth: false },
  { path: "/cart/items", method: "POST", service: "cart", auth: false },
  {
    path: "/cart/items/:productId",
    method: "ALL",
    service: "cart",
    auth: false,
  },
  // NOTE: /cart/checkout géré directement par l'API Gateway dans routes orchestrées
];
