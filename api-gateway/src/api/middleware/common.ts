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
export const corsMiddleware: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  // Récupérer la liste des origines autorisées depuis les variables d'environnement
  const allowedOriginsEnv = process.env["ALLOWED_ORIGINS"];

  let allowedOrigins: string[];

  if (!allowedOriginsEnv) {
    // En production, autoriser toutes les origines temporairement (avec avertissement)
    // En développement, utiliser localhost uniquement
    if (process.env["NODE_ENV"] === "production") {
      console.warn("⚠️⚠️⚠️ CORS: ALLOWED_ORIGINS non configuré en PRODUCTION!");
      console.warn("⚠️⚠️⚠️ Mode permissif activé temporairement - CONFIGUREZ ALLOWED_ORIGINS dans Railway!");
      // Mode permissif temporaire pour le debug
      allowedOrigins = ["*"]; // Sera traité spécialement
    } else {
      // Valeurs par défaut pour le développement local
      allowedOrigins = [
        "http://localhost:3000", // API Gateway (pour les tests)
        "http://localhost:3009", // Backoffice Next.js
        "http://localhost:3010", // Frontend Next.js
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3009",
        "http://127.0.0.1:3010",
      ];
      console.warn("⚠️ CORS: ALLOWED_ORIGINS non configuré - utilisation des valeurs par défaut (localhost uniquement)");
    }
  } else {
    allowedOrigins = allowedOriginsEnv.split(",").map((o) => o.trim());
    console.log(`✅ CORS: ${allowedOrigins.length} origine(s) autorisée(s): ${allowedOrigins.join(", ")}`);
  }

  const origin = req.headers.origin;

  // Gérer les requêtes OPTIONS (preflight) manuellement pour éviter les erreurs 500
  if (req.method === "OPTIONS") {
    // Mode permissif temporaire si ALLOWED_ORIGINS n'est pas configuré en production
    if (allowedOrigins.includes("*")) {
      res.header("Access-Control-Allow-Origin", origin || "*");
      res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
      res.header("Access-Control-Allow-Headers", "Content-Type, X-Requested-With, Accept, Authorization, Cookie, x-cart-session-id");
      res.header("Access-Control-Expose-Headers", "Set-Cookie");
      // Note: credentials ne peut pas être true avec Access-Control-Allow-Origin: *
      // Mais on l'autorise quand même pour le debug temporaire
      return res.status(204).end();
    }

    // Si pas d'origine, autoriser (pour les outils comme Postman)
    if (!origin) {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
      res.header("Access-Control-Allow-Headers", "Content-Type, X-Requested-With, Accept, Authorization, Cookie, x-cart-session-id");
      return res.status(204).end();
    }

    // Vérifier si l'origine est autorisée
    if (allowedOrigins.includes(origin)) {
      res.header("Access-Control-Allow-Origin", origin);
      res.header("Access-Control-Allow-Credentials", "true");
      res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
      res.header("Access-Control-Allow-Headers", "Content-Type, X-Requested-With, Accept, Authorization, Cookie, x-cart-session-id");
      res.header("Access-Control-Expose-Headers", "Set-Cookie");
      return res.status(204).end();
    } else {
      console.warn(`⚠️ CORS: Origine non autorisée pour OPTIONS: ${origin}`);
      console.warn(`⚠️ CORS: Origines autorisées: ${allowedOrigins.join(", ")}`);
      // Retourner 403 au lieu de 500 pour les requêtes OPTIONS non autorisées
      return res.status(403).json({
        error: "CORS Error",
        message: "Origin not allowed",
        origin: origin,
      });
    }
  }

  // Pour les autres méthodes, utiliser le middleware CORS standard
  return cors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Mode permissif temporaire si ALLOWED_ORIGINS n'est pas configuré en production
      if (allowedOrigins.includes("*")) {
        return callback(null, true);
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
        console.warn(`⚠️ CORS: Origines autorisées: ${allowedOrigins.join(", ")}`);
        // Rejeter l'origine non autorisée
        callback(null, false);
      }
    },
    credentials: !allowedOrigins.includes("*"), // Ne pas utiliser credentials avec "*"
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
    optionsSuccessStatus: 204,
  })(req, res, next);
};

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
