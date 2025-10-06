/**
 * API GATEWAY - VERSION RÉORGANISÉE ET MODULAIRE
 */

import express from "express";
import { PORT, isDevelopment, SERVICES } from "./config";
import { setupGlobalMiddlewares, setupErrorHandling } from "./middleware";
import { setupRoutes } from "./routes-handler";

// ===== INITIALISATION DE L'APPLICATION =====
const app = express();

// ===== CONFIGURATION DES MIDDLEWARES =====
setupGlobalMiddlewares(app);

// ===== CONFIGURATION DES ROUTES =====
setupRoutes(app);

// ===== GESTION DES ERREURS =====
setupErrorHandling(app);

// ===== DÉMARRAGE DU SERVEUR =====
app.listen(PORT, () => {
  console.log("╔════════════════════════════════════════╗");
  console.log("║   🚀 API GATEWAY - MODULAIRE v2.0      ║");
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
