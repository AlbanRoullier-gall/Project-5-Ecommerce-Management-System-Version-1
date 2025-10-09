/**
 * Middlewares pour l'API Gateway
 */

import express from "express";
import cors from "cors";
import helmet from "helmet";

// ===== HELPERS PRIVÉS =====

/**
 * Détermine si une route doit skipper le parsing du body (multipart/form-data)
 */
const isMultipartRoute = (req: express.Request): boolean => {
  return (
    (req.path.includes("/images") && req.method === "POST") ||
    req.path.includes("/with-images")
  );
};

// ===== CONFIGURATION DES MIDDLEWARES =====

/**
 * Configure les middlewares globaux
 */
export const setupGlobalMiddlewares = (app: express.Application): void => {
  // ===== SÉCURITÉ =====

  // Configuration CORS (avant Helmet pour éviter les conflits)
  app.use(
    cors({
      origin: true, // Accepte toutes les origines en développement
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  // Configuration Helmet avec règles adaptées au développement
  app.use(
    helmet({
      crossOriginResourcePolicy: false, // Désactive la politique stricte cross-origin
    })
  );

  // ===== PARSING DU BODY =====

  // Parser JSON (SAUF pour routes multipart/form-data)
  app.use((req, res, next) => {
    if (isMultipartRoute(req)) {
      next(); // Skip le parsing pour multipart
    } else {
      express.json({ limit: "10mb" })(req, res, next);
    }
  });

  // Parser URL-encoded (SAUF pour routes multipart/form-data)
  app.use((req, res, next) => {
    if (isMultipartRoute(req)) {
      next(); // Skip le parsing pour multipart
    } else {
      express.urlencoded({ extended: true })(req, res, next);
    }
  });
};

/**
 * Middleware de gestion des erreurs 404
 */
export const setupErrorHandling = (app: express.Application): void => {
  app.use((req, res) => {
    res.status(404).json({
      error: "Not Found",
      message: "Route non trouvée",
      path: req.path,
    });
  });
};
