/**
 * Configuration des routes simples (proxy direct)
 * Importe toutes les routes définies dans le nouveau format déclaratif
 */

import { SimpleRoute } from "../../core/types";
import { PRODUCT_ROUTES } from "../product-routes";
import { ORDER_ROUTES } from "../order-routes";
import { CART_ROUTES } from "../cart-routes";
import { CUSTOMER_ROUTES } from "../customer-routes";
import { PAYMENT_ROUTES } from "../payment-routes";
import { EMAIL_ROUTES } from "../email-routes";
import { PDF_EXPORT_ROUTES } from "../pdf-export-routes";
import { AUTH_ROUTES } from "../auth-routes";

/**
 * Configuration complète des routes simples
 */
export const SIMPLE_ROUTES: SimpleRoute[] = [
  ...PRODUCT_ROUTES,
  ...ORDER_ROUTES,
  ...CART_ROUTES,
  ...CUSTOMER_ROUTES,
  ...PAYMENT_ROUTES,
  ...EMAIL_ROUTES,
  ...PDF_EXPORT_ROUTES,
  ...AUTH_ROUTES,
];
