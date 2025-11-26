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
  notFoundHandler,
  errorHandler,
} from "./common";
