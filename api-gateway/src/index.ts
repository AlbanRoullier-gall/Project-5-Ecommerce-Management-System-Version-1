/**
 * API GATEWAY - PROXY SIMPLE
 *
 * Architecture simplifiée - Proxy automatique
 * - Proxy automatique vers les services backend
 * - Handlers spéciaux uniquement pour l'orchestration (auth, payment, export)
 * - Détection automatique du service à partir du chemin de la route
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
  console.log("║   🚀 API GATEWAY - PROXY SIMPLE        ║");
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
