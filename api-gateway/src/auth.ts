/**
 * Module d'authentification pour l'API Gateway
 * Gère la vérification JWT et la protection des routes
 */

import jwt from "jsonwebtoken";
import { JWT_SECRET } from "./config";

// ===== TYPES =====

export interface AuthenticatedUser {
  userId: string;
  email: string;
  [key: string]: any;
}

// ===== VÉRIFICATION DES ROUTES =====

/**
 * Vérifie si une route nécessite une authentification
 * Routes protégées : /admin/* et /api/customers
 */
export const isProtectedRoute = (path: string): boolean => {
  return path.includes("/admin/") || path === "/api/customers";
};

// ===== GESTION DES TOKENS JWT =====

/**
 * Vérifie et décode un token JWT
 * Retourne l'utilisateur authentifié ou null si invalide
 */
export const verifyToken = (token: string): AuthenticatedUser | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthenticatedUser;
  } catch (error) {
    return null;
  }
};

/**
 * Extrait le token d'authentification depuis les headers
 * Format attendu : "Bearer <token>"
 */
export const extractToken = (authHeader: string | undefined): string | null => {
  if (!authHeader) return null;
  const parts = authHeader.split(" ");
  return parts.length === 2 && parts[0] === "Bearer" ? parts[1] || null : null;
};
