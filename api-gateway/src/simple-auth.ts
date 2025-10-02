/**
 * Authentification JWT simplifiée pour l'API Gateway
 */

import jwt from "jsonwebtoken";

// ===== CONFIGURATION JWT =====
const JWT_SECRET = process.env["JWT_SECRET"] || "your-jwt-secret-key";

// ===== FONCTION DE VÉRIFICATION DES ROUTES PROTÉGÉES =====
export const isProtectedRoute = (path: string): boolean => {
  // Seules les routes contenant "admin" nécessitent une authentification
  return path.includes("/admin/");
};

// ===== FONCTION DE VÉRIFICATION JWT =====
export const verifyToken = (token: string): any | null => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};
