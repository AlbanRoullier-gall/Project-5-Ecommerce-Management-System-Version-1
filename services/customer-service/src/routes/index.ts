/**
 * Routes Index
 * Export centralisé de toutes les routes
 *
 * Architecture : Route definition pattern
 * - Export centralisé des routes
 * - Compatible avec Service Registry
 */

export {
  getCustomerRoutes,
  getAddressRoutes,
  getCompanyRoutes,
  getPublicRoutes,
  getProtectedRoutes,
  type RouteDefinition,
} from "./customer.routes";

export { getHealthRoutes } from "./health.routes";
