/**
 * Index des routes - Combine toutes les routes par service
 */

import { ServiceName } from "../config";
import { AUTH_ROUTES } from "./auth-routes";
import { PRODUCT_ROUTES } from "./product-routes";
import { ORDER_ROUTES } from "./order-routes";
import { OTHER_ROUTES } from "./other-routes";

/**
 * Combine toutes les routes en un seul objet
 */
export const ROUTES: Record<string, ServiceName> = {
  ...AUTH_ROUTES,
  ...PRODUCT_ROUTES,
  ...ORDER_ROUTES,
  ...OTHER_ROUTES,
};
