/**
 * Module d'authentification pour l'API Gateway
 */

import jwt from "jsonwebtoken";
import { JWT_SECRET } from "./config";

export interface AuthenticatedUser {
  userId: string;
  email: string;
  [key: string]: any;
}

/**
 * Vérifie si une route nécessite une authentification
 */
export const isProtectedRoute = (path: string): boolean => {
  return path.includes("/admin/");
};

/**
 * Vérifie et décode un token JWT
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
 */
export const extractToken = (authHeader: string | undefined): string | null => {
  if (!authHeader) return null;
  const parts = authHeader.split(" ");
  return parts.length === 2 && parts[0] === "Bearer" ? parts[1] || null : null;
};
