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
 * Normalise une URL d'origine pour la comparaison
 * Gère les cas avec/sans https://
 */
function normalizeOrigin(origin: string): string {
  if (!origin) return origin;
  // Si l'origine commence déjà par http:// ou https://, la retourner telle quelle
  if (origin.startsWith("http://") || origin.startsWith("https://")) {
    return origin;
  }
  // Sinon, ajouter https:// par défaut
  return `https://${origin}`;
}

/**
 * Vérifie si une origine est dans la liste autorisée
 * Gère les comparaisons avec/sans https://
 * Gère aussi les correspondances entre URLs Railway internes et publiques
 */
function isOriginAllowed(origin: string, allowedOrigins: string[]): boolean {
  if (!origin) return false;

  // Normaliser l'origine
  const normalizedOrigin = normalizeOrigin(origin);

  // Vérifier si l'origine normalisée est dans la liste
  if (allowedOrigins.includes(normalizedOrigin)) {
    return true;
  }

  // Vérifier aussi sans normalisation (au cas où)
  if (allowedOrigins.includes(origin)) {
    return true;
  }

  // Vérifier aussi en normalisant chaque origine autorisée
  for (const allowed of allowedOrigins) {
    if (normalizeOrigin(allowed) === normalizedOrigin) {
      return true;
    }
  }

  // Gestion spéciale pour Railway : autoriser automatiquement toutes les URLs Railway
  // si on est en production et que l'origine est une URL Railway
  if (
    normalizedOrigin.includes(".up.railway.app") ||
    normalizedOrigin.includes("railway.app")
  ) {
    // En production Railway, autoriser TOUJOURS toutes les URLs Railway automatiquement
    // (même si ALLOWED_ORIGINS est défini)
    if (process.env["NODE_ENV"] === "production") {
      console.log(
        `✅ CORS: URL Railway autorisée automatiquement en production: ${normalizedOrigin}`
      );
      return true;
    }

    // Extraire le nom du service depuis l'URL publique (ex: "frontend" depuis "frontend-production-27ff")
    const publicUrlMatch = normalizedOrigin.match(/https?:\/\/([^-]+)-/);
    if (publicUrlMatch) {
      const serviceName = publicUrlMatch[1];
      // Vérifier si l'URL interne correspondante est autorisée (avec normalisation)
      const internalUrl = normalizeOrigin(`${serviceName}.railway.internal`);
      for (const allowed of allowedOrigins) {
        const normalizedAllowed = normalizeOrigin(allowed);
        if (
          normalizedAllowed === internalUrl ||
          normalizedAllowed.includes(`${serviceName}.railway.internal`)
        ) {
          console.log(
            `✅ CORS: URL publique Railway autorisée via URL interne: ${normalizedOrigin} (service: ${serviceName})`
          );
          return true;
        }
      }
    }
  }

  return false;
}

/**
 * Configuration CORS
 * IMPORTANT: Avec credentials: true, on ne peut pas utiliser origin: true ou "*"
 * Il faut spécifier explicitement les origines autorisées
 */
export const corsMiddleware: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Récupérer la liste des origines autorisées depuis les variables d'environnement
  const allowedOriginsEnv = process.env["ALLOWED_ORIGINS"];

  let allowedOrigins: string[];

  if (!allowedOriginsEnv) {
    // En production, autoriser automatiquement toutes les URLs Railway
    // En développement, utiliser localhost uniquement
    if (process.env["NODE_ENV"] === "production") {
      console.warn("⚠️⚠️⚠️ CORS: ALLOWED_ORIGINS non configuré en PRODUCTION!");
      console.warn(
        "⚠️⚠️⚠️ Mode permissif activé pour les URLs Railway - CONFIGUREZ ALLOWED_ORIGINS dans Railway pour plus de sécurité!"
      );
      // Mode permissif pour Railway uniquement (géré dans isOriginAllowed)
      allowedOrigins = []; // Vide, mais isOriginAllowed gérera les URLs Railway
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
      console.warn(
        "⚠️ CORS: ALLOWED_ORIGINS non configuré - utilisation des valeurs par défaut (localhost uniquement)"
      );
    }
  } else {
    allowedOrigins = allowedOriginsEnv.split(",").map((o) => {
      const trimmed = o.trim();
      // Normaliser : ajouter https:// si ce n'est pas déjà présent
      if (
        trimmed &&
        !trimmed.startsWith("http://") &&
        !trimmed.startsWith("https://")
      ) {
        return `https://${trimmed}`;
      }
      return trimmed;
    });
    console.log(
      `✅ CORS: ${
        allowedOrigins.length
      } origine(s) autorisée(s): ${allowedOrigins.join(", ")}`
    );
  }

  const origin = req.headers.origin;

  // Gérer les requêtes OPTIONS (preflight) manuellement pour éviter les erreurs 500
  if (req.method === "OPTIONS") {
    // En production Railway, autoriser TOUJOURS les URLs Railway (même si ALLOWED_ORIGINS est défini)
    if (
      process.env["NODE_ENV"] === "production" &&
      origin &&
      (origin.includes(".up.railway.app") || origin.includes("railway.app"))
    ) {
      console.log(
        `✅ CORS: Autorisation automatique pour OPTIONS (Railway): ${origin}`
      );
      res.header("Access-Control-Allow-Origin", origin);
      res.header("Access-Control-Allow-Credentials", "true");
      res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, PATCH, OPTIONS"
      );
      res.header(
        "Access-Control-Allow-Headers",
        "Content-Type, X-Requested-With, Accept, Authorization, Cookie, x-cart-session-id"
      );
      res.header(
        "Access-Control-Expose-Headers",
        "Set-Cookie, X-Cart-Session-Id"
      );
      return res.status(204).end();
    }

    // Si pas d'origine, autoriser (pour les outils comme Postman)
    if (!origin) {
      res.header("Access-Control-Allow-Origin", "*");
      res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, PATCH, OPTIONS"
      );
      res.header(
        "Access-Control-Allow-Headers",
        "Content-Type, X-Requested-With, Accept, Authorization, Cookie, x-cart-session-id"
      );
      return res.status(204).end();
    }

    // Vérifier si l'origine est autorisée (avec normalisation)
    if (isOriginAllowed(origin, allowedOrigins)) {
      res.header("Access-Control-Allow-Origin", origin);
      res.header("Access-Control-Allow-Credentials", "true");
      res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, PATCH, OPTIONS"
      );
      res.header(
        "Access-Control-Allow-Headers",
        "Content-Type, X-Requested-With, Accept, Authorization, Cookie, x-cart-session-id"
      );
      res.header(
        "Access-Control-Expose-Headers",
        "Set-Cookie, X-Cart-Session-Id"
      );
      return res.status(204).end();
    } else {
      console.warn(`⚠️ CORS: Origine non autorisée pour OPTIONS: ${origin}`);
      console.warn(
        `⚠️ CORS: Origines autorisées: ${allowedOrigins.join(", ")}`
      );
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
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void
    ) => {
      // En production Railway, autoriser TOUJOURS les URLs Railway (même si ALLOWED_ORIGINS est défini)
      if (
        process.env["NODE_ENV"] === "production" &&
        origin &&
        (origin.includes(".up.railway.app") || origin.includes("railway.app"))
      ) {
        console.log(
          `✅ CORS: Autorisation automatique (Railway): ${origin}`
        );
        return callback(null, true);
      }

      // Autoriser les requêtes sans origine (ex: Postman, mobile apps, SSR)
      if (!origin) {
        return callback(null, true);
      }

      // Vérifier si l'origine est dans la liste autorisée (avec normalisation)
      if (isOriginAllowed(origin, allowedOrigins)) {
        callback(null, true);
      } else {
        console.warn(`⚠️ CORS: Origine non autorisée: ${origin}`);
        console.warn(
          `⚠️ CORS: Origines autorisées: ${allowedOrigins.join(", ")}`
        );
        // Rejeter l'origine non autorisée
        callback(null, false);
      }
    },
    credentials: true, // Toujours autoriser les credentials pour les requêtes autorisées
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "X-Requested-With",
      "Accept",
      "Authorization",
      "Cookie",
      "x-cart-session-id",
    ],
    exposedHeaders: ["Set-Cookie", "X-Cart-Session-Id"],
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
