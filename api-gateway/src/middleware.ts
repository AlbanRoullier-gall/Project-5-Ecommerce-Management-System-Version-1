/**
 * Middlewares pour l'API Gateway
 *
 * Ce fichier contient toute la configuration des middlewares globaux de l'API Gateway:
 * - Sécurité (CORS, Helmet)
 * - Parsing des requêtes (JSON, URL-encoded, multipart, raw body)
 * - Gestion des erreurs (404)
 */

import express from "express";
import cors from "cors";
import helmet from "helmet";

// ===== HELPERS PRIVÉS =====

/**
 * Détermine si une route doit skipper le parsing automatique du body
 *
 * Pourquoi cette fonction existe:
 * - Les routes multipart/form-data (upload d'images) doivent être gérées par multer
 * - Si on parse le body avec express.json() avant multer, le body est déjà consommé
 * - Il faut donc skip le parsing JSON/URL-encoded pour ces routes spécifiques
 *
 * Routes concernées:
 * - POST /api/.../images (upload d'images)
 * - POST /api/.../with-images (création avec images)
 *
 * @param req - La requête Express
 * @returns true si la route doit skip le parsing du body
 */
const isMultipartRoute = (req: express.Request): boolean => {
  return (
    (req.path.includes("/images") && req.method === "POST") ||
    req.path.includes("/with-images")
  );
};

// ===== CONFIGURATION DES MIDDLEWARES =====

/**
 * Configure les middlewares globaux de l'application Express
 *
 * Cette fonction doit être appelée AVANT la configuration des routes.
 * L'ordre des middlewares est important car ils sont exécutés séquentiellement.
 *
 * Ordre d'exécution:
 * 1. CORS (Cross-Origin Resource Sharing)
 * 2. Helmet (sécurisation des headers HTTP)
 * 3. Parsing JSON conditionnel
 * 4. Parsing URL-encoded conditionnel
 * 5. Raw body pour webhooks Stripe
 *
 * @param app - L'instance Express à configurer
 */
export const setupGlobalMiddlewares = (app: express.Application): void => {
  // ===== SÉCURITÉ =====

  /**
   * Configuration CORS (Cross-Origin Resource Sharing)
   *
   * IMPORTANT: Doit être configuré AVANT Helmet pour éviter les conflits de headers
   *
   * Configuration actuelle:
   * - origin: true → Accepte toutes les origines (flexible en développement)
   *   Pour la production, considérer de restreindre à des domaines spécifiques
   * - credentials: true → Permet l'envoi de cookies/credentials avec les requêtes
   * - methods: Liste des méthodes HTTP autorisées
   * - allowedHeaders: Headers autorisés dans les requêtes cross-origin
   *   (Content-Type pour les données, Authorization pour les tokens JWT)
   */
  app.use(
    cors({
      origin: true, // Accepte toutes les origines en développement
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  /**
   * Configuration Helmet - Sécurisation des headers HTTP
   *
   * Helmet ajoute automatiquement des headers de sécurité pour protéger l'application
   * contre certaines vulnérabilités courantes (XSS, clickjacking, etc.)
   *
   * Configuration:
   * - crossOriginResourcePolicy: false → Désactive la politique stricte CORS de Helmet
   *   Nécessaire car on utilise CORS manuellement avec des règles plus flexibles
   *   Cela permet de servir des ressources (images, fichiers) depuis différentes origines
   */
  app.use(
    helmet({
      crossOriginResourcePolicy: false, // Désactive la politique stricte cross-origin
    })
  );

  // ===== PARSING DU BODY =====

  /**
   * Middleware de parsing JSON conditionnel
   *
   * Pourquoi conditionnel:
   * - Les routes multipart/form-data (upload d'images) doivent être traitées par multer
   *   Si on parse le body en JSON avant, le stream est consommé et multer ne peut plus lire les fichiers
   * - Les webhooks Stripe nécessitent le body brut (raw) pour vérifier la signature
   *   Si on parse en JSON, on perd l'intégrité du body nécessaire à la vérification
   *
   * Limite: 10mb pour supporter les payloads JSON volumineux (ex: listes de produits)
   *
   * Routes exclues:
   * - Routes multipart (détectées par isMultipartRoute)
   * - /api/webhooks/stripe (nécessite raw body)
   */
  app.use((req, res, next) => {
    if (isMultipartRoute(req) || req.path === "/api/webhooks/stripe") {
      next(); // Skip le parsing pour multipart et webhooks Stripe
    } else {
      express.json({ limit: "10mb" })(req, res, next);
    }
  });

  /**
   * Middleware de parsing URL-encoded conditionnel
   *
   * Parse les données envoyées avec Content-Type: application/x-www-form-urlencoded
   * (typiquement depuis des formulaires HTML)
   *
   * Même logique conditionnelle que pour le JSON:
   * - Skip pour les routes multipart (multer gère ça)
   * - Skip pour les webhooks Stripe (besoin du raw body)
   *
   * extended: true → Utilise qs library pour parser les objets complexes/nested
   */
  app.use((req, res, next) => {
    if (isMultipartRoute(req) || req.path === "/api/webhooks/stripe") {
      next(); // Skip le parsing pour multipart et webhooks Stripe
    } else {
      express.urlencoded({ extended: true })(req, res, next);
    }
  });

  /**
   * Middleware spécifique pour les webhooks Stripe
   *
   * IMPORTANT: Doit être placé APRÈS les middlewares de parsing JSON/URL-encoded
   * mais AVANT la route qui gère le webhook
   *
   * Pourquoi ce middleware existe:
   * - Stripe nécessite le body brut (raw) pour vérifier la signature du webhook
   * - La signature est calculée à partir du body exact tel qu'il a été envoyé
   * - Si le body est parsé/modifié avant, la vérification de signature échouera
   *
   * Fonctionnement:
   * 1. Collecte tous les chunks du body dans un tableau de buffers
   * 2. Une fois le body complet reçu, concatène tous les buffers
   * 3. Stocke le body brut dans req.rawBody pour utilisation ultérieure
   *
   * Note: Ce middleware ne s'applique QUE sur /api/webhooks/stripe
   * Les autres routes continuent d'utiliser le parsing JSON normal
   */
  app.use("/api/webhooks/stripe", (req: any, _res, next) => {
    let data: Buffer[] = [];
    req.on("data", (chunk: Buffer) => data.push(chunk));
    req.on("end", () => {
      req.rawBody = Buffer.concat(data);
      next();
    });
  });
};

/**
 * Configure le middleware de gestion des erreurs 404
 *
 * IMPORTANT: Cette fonction doit être appelée APRÈS toutes les routes
 * car elle agit comme un catch-all pour les routes non trouvées.
 *
 * Dans Express, l'ordre des middlewares est crucial:
 * 1. Middlewares globaux (setupGlobalMiddlewares)
 * 2. Routes (setupRoutes)
 * 3. Gestion des erreurs (setupErrorHandling) ← ICI
 *
 * Si une requête arrive jusqu'à ce middleware, cela signifie qu'aucune route
 * n'a matche avec le chemin demandé. On retourne donc une erreur 404 standardisée.
 *
 * Format de réponse:
 * - status: 404 (Not Found)
 * - body: JSON avec error, message et path pour faciliter le debugging
 *
 * @param app - L'instance Express à configurer
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
