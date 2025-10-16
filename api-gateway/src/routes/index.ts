/**
 * Index des routes - Combine toutes les routes par service
 */

import { ServiceName } from "../config";
import { AUTH_ROUTES } from "./auth-routes";
import { PRODUCT_ROUTES } from "./product-routes";
import { ORDER_ROUTES } from "./order-routes";
import { CART_ROUTES } from "./cart-routes";
import { CUSTOMER_ROUTES } from "./customer-routes";
import { PAYMENT_ROUTES } from "./payment-routes";
import { EMAIL_ROUTES } from "./email-routes";

/**
 * Combine toutes les routes en un seul objet
 */
export const ROUTES: Record<string, ServiceName> = {
  ...AUTH_ROUTES,
  ...PRODUCT_ROUTES,
  ...ORDER_ROUTES,
  ...CART_ROUTES,
  ...CUSTOMER_ROUTES,
  ...PAYMENT_ROUTES,
  ...EMAIL_ROUTES,
};
