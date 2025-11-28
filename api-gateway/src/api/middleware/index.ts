/**
 * Middlewares pour l'API Gateway
 */

// Middlewares d'authentification
export {
  requireAuth,
  verifyToken,
  extractToken,
  AuthenticatedUser,
} from "./auth";

// Middlewares communs (sécurité et gestion d'erreurs)
export {
  corsMiddleware,
  helmetMiddleware,
  cookieParserMiddleware,
  notFoundHandler,
  errorHandler,
} from "./common";

// Middleware de gestion de session pour le panier
export {
  cartSessionMiddleware,
  handleCreateCartSession,
  generateCartSessionId,
  extractCartSessionId,
  CART_SESSION_COOKIE,
} from "./cart-session";
