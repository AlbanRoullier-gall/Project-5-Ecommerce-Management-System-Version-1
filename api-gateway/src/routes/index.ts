/**
 * Index des routes - Combine toutes les routes par type
 */

import { RouteCollection } from "../core/types";
import { SIMPLE_ROUTES } from "./simple";
import { ORCHESTRATED_ROUTES } from "./orchestrated";
import { STATIC_ROUTES } from "./static";

/**
 * Collection complète de toutes les routes
 */
export const ROUTES: RouteCollection = {
  simple: SIMPLE_ROUTES,
  orchestrated: ORCHESTRATED_ROUTES,
  static: STATIC_ROUTES,
};
