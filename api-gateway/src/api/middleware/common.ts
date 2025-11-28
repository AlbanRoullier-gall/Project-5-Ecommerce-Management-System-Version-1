/**
 * Middlewares communs pour l'API Gateway
 * Regroupe sécurité et gestion d'erreurs
 */

import { Request, Response, NextFunction, RequestHandler } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";

// ===== MIDDLEWARES DE SÉCURITÉ =====

/**
 * Configuration CORS
 * IMPORTANT: Avec credentials: true, on ne peut pas utiliser origin: true ou "*"
 * Il faut spécifier explicitement les origines autorisées
 */
export const corsMiddleware: RequestHandler = cors({
  origin: (origin, callback) => {
    // Récupérer la liste des origines autorisées depuis les variables d'environnement
    const allowedOriginsEnv = process.env["ALLOWED_ORIGINS"];

    let allowedOrigins: string[];

    if (!allowedOriginsEnv) {
      // Valeurs par défaut pour le développement local
      allowedOrigins = [
        "http://localhost:3000", // Frontend Next.js
        "http://localhost:3009", // Backoffice Next.js
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3009",
      ];
    } else {
      allowedOrigins = allowedOriginsEnv.split(",").map((o) => o.trim());
    }

    // Autoriser les requêtes sans origine (ex: Postman, mobile apps, SSR)
    if (!origin) {
      return callback(null, true);
    }

    // Vérifier si l'origine est dans la liste autorisée
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`⚠️ CORS: Origine non autorisée: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, // Nécessaire pour les cookies httpOnly
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
  ],
});

/**
 * Configuration Helmet pour la sécurité HTTP
 */
export const helmetMiddleware: RequestHandler = helmet({
  crossOriginResourcePolicy: false,
});

/**
 * Middleware pour parser les cookies
 */
export const cookieParserMiddleware: RequestHandler = cookieParser();

// ===== MIDDLEWARES DE GESTION D'ERREURS =====

/**
 * Middleware pour gérer les routes non trouvées (404)
 * Doit être placé en dernier, après toutes les routes
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  res.status(404).json({
    error: "Not Found",
    message: "Route non trouvée",
    path: req.path,
  });
};

/**
 * Middleware de gestion d'erreurs globale
 * Capture toutes les erreurs non gérées et retourne une réponse 500
 * Doit être placé après toutes les routes et le middleware 404
 */
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error("❌ Unhandled error:", err);

  // Si la réponse a déjà été envoyée, déléguer au gestionnaire d'erreurs par défaut d'Express
  if (res.headersSent) {
    return _next(err);
  }

  // Retourner une réponse d'erreur standardisée
  res.status(500).json({
    error: "Internal Server Error",
    message: "Une erreur interne est survenue",
    ...(process.env["NODE_ENV"] === "development" && {
      details: err.message,
      stack: err.stack,
    }),
  });
};
