/**
 * Middlewares pour l'API Gateway
 */

import express from "express";
import cors from "cors";
import helmet from "helmet";

/**
 * Configure les middlewares globaux
 */
export const setupGlobalMiddlewares = (app: express.Application): void => {
  // Configuration CORS AVANT Helmet pour éviter les conflits
  app.use(
    cors({
      origin: true, // Accepte toutes les origines en développement
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  // Configuration Helmet avec des règles moins strictes pour le développement
  app.use(
    helmet({
      crossOriginResourcePolicy: false, // Désactive la politique stricte cross-origin
    })
  );

  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true }));
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
