/**
 * Middleware de gestion d'erreurs centralisé
 * Capture et formate toutes les erreurs non gérées
 */

import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger";

/**
 * Format de réponse d'erreur standardisé
 */
export interface ErrorResponse {
  error: string;
  message: string;
  timestamp: string;
  statusCode: number;
  requestId?: string;
  service?: string;
}

/**
 * Middleware de gestion des erreurs globales
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Logger l'erreur
  logger.error("Unhandled error in API Gateway", {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Construire la réponse d'erreur
  const errorResponse: ErrorResponse = {
    error: "Internal Server Error",
    message:
      process.env["NODE_ENV"] === "production"
        ? "An unexpected error occurred"
        : err.message,
    timestamp: new Date().toISOString(),
    statusCode: 500,
  };

  // En développement, ajouter la stack trace
  if (process.env["NODE_ENV"] === "development") {
    (errorResponse as any).stack = err.stack;
  }

  res.status(500).json(errorResponse);
};

/**
 * Middleware pour gérer les routes non trouvées (404)
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  const errorResponse: ErrorResponse = {
    error: "Route Not Found",
    message: `The requested route ${req.method} ${req.originalUrl} does not exist`,
    timestamp: new Date().toISOString(),
    statusCode: 404,
  };

  logger.warn("Route not found", {
    method: req.method,
    path: req.originalUrl,
  });

  res.status(404).json(errorResponse);
};
