/**
 * API GATEWAY - POINT D'ENTRÉE PRINCIPAL
 *
 * Architecture v2.2 - Refactorisée et modulaire:
 * - Structure modulaire claire (types, conventions, proxy, uploads)
 * - Router simplifié (enregistrement uniquement)
 * - Proxy séparé (request/response)
 * - Configuration déclarative avec conventions automatiques
 * - Un seul type Route pour tous les types de routes
 * - Conventions: /admin/* = auth auto, /with-images = upload auto
 * - Une seule boucle pour toutes les routes
 */

import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { PORT, isDevelopment, SERVICES } from "./config";
import { setupGlobalMiddlewares, setupErrorHandling } from "./middleware";
import { setupRoutes } from "./core/router";
import { ROUTES } from "./routes";

// ===== INITIALISATION =====

const app = express();

// ===== CONFIGURATION =====

// 1. Middlewares globaux (CORS, Helmet, body parsers)
setupGlobalMiddlewares(app);

// 2. Routes (configuration déclarative)
setupRoutes(app, ROUTES);

// 3. Gestion des erreurs (404, 500)
setupErrorHandling(app);

// ===== DÉMARRAGE =====

app.listen(PORT, () => {
  console.log("╔════════════════════════════════════════╗");
  console.log("║   🚀 API GATEWAY - MODULAIRE v2.2      ║");
  console.log("╚════════════════════════════════════════╝");
  console.log("");
  console.log(`📍 Port: ${PORT}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log(`📊 Health: http://localhost:${PORT}/api/health`);
  console.log(
    `🔧 Mode: ${
      isDevelopment ? "DEVELOPMENT (localhost)" : "DOCKER (containers)"
    }`
  );
  console.log(`🔗 Auth Service: ${SERVICES.auth}`);
  console.log("");
});
