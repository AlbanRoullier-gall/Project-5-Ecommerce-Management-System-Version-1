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
import { ApiRouter } from "./api";

// ===== INITIALISATION =====

const app = express();

// ===== CONFIGURATION =====

// Routes (via ApiRouter - les middlewares sont gérés dans ApiRouter)
const apiRouter = new ApiRouter();
apiRouter.setupRoutes(app);

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
