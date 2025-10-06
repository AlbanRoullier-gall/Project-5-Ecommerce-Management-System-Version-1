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
  app.use(helmet());
  app.use(cors());
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
