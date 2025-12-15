/**
 * Middlewares communs pour l'API Gateway
 * Regroupe sécurité et gestion d'erreurs
 */

import { Request, Response, NextFunction, RequestHandler } from "express";
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");

// ===== MIDDLEWARES DE SÉCURITÉ =====

/**
 * Configuration CORS
 * IMPORTANT: Avec credentials: true, on ne peut pas utiliser origin: true ou "*"
 * Il faut spécifier explicitement les origines autorisées
 */
export const corsMiddleware: RequestHandler = cors({
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) => {
    // Récupérer la liste des origines autorisées depuis les variables d'environnement
    const allowedOriginsEnv = process.env["ALLOWED_ORIGINS"];

    let allowedOrigins: string[];

    if (!allowedOriginsEnv) {
      // Valeurs par défaut pour le développement local
      allowedOrigins = [
        "http://localhost:3000", // API Gateway (pour les tests)
        "http://localhost:3009", // Backoffice Next.js
        "http://localhost:3010", // Frontend Next.js
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3009",
        "http://127.0.0.1:3010",
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
      // En production, on peut être plus permissif pour le debug
      // Mais idéalement, il faut configurer ALLOWED_ORIGINS dans Railway
      if (process.env["NODE_ENV"] === "production") {
        console.warn(`⚠️ CORS: Mode production - Vérifiez ALLOWED_ORIGINS dans Railway`);
      }
      // Rejeter l'origine non autorisée
      callback(null, false);
    }
  },
  credentials: true, // Nécessaire pour les cookies httpOnly
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "X-Requested-With",
    "Accept",
    "Authorization",
    "Cookie",
    "x-cart-session-id",
  ],
  exposedHeaders: ["Set-Cookie"],
  preflightContinue: false,
  optionsSuccessStatus: 204, // Répondre avec 204 No Content pour les requêtes OPTIONS réussies
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
