/**
 * API GATEWAY - POINT D'ENTRÉE PRINCIPAL
 *
 * Architecture v3.0 - Pattern ApiRouter direct
 * - Routes enregistrées directement (comme les services)
 * - Pas de couche de configuration déclarative
 * - Handlers séparés pour la logique métier
 * - Conventions automatiques appliquées lors de l'enregistrement
 */

import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { PORT, isDevelopment, SERVICES } from "./config";
import { setupGlobalMiddlewares, setupErrorHandling } from "./middleware";
import { ApiRouter } from "./api/router/ApiRouter";

// ===== INITIALISATION =====

const app = express();

// ===== CONFIGURATION =====

// 1. Middlewares globaux (CORS, Helmet, body parsers)
setupGlobalMiddlewares(app);

// 2. Routes (via ApiRouter avec controllers)
const apiRouter = new ApiRouter();
apiRouter.setupRoutes(app);

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
