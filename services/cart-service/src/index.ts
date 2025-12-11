/**
 * Cart Service - Entry Point
 * Main application entry point for cart-service
 *
 * Architecture : Microservice pattern
 * - Express.js server
 * - Redis cart management
 * - Health checks
 */

import { ApiRouter } from "./api";

// Load environment variables
require("dotenv").config();

// Import express with require to avoid TypeScript compilation issues
const express = require("express");

// Configuration
const PORT = process.env.PORT || 3004;

/**
 * Fonction principale pour démarrer le service
 */
async function startService(): Promise<void> {
  try {
    console.log("🚀 Starting Cart Service...");

    // Configuration de l'application Express
    const app = express();

    // Configuration de l'API Router
    const apiRouter = new ApiRouter();
    apiRouter.setupRoutes(app);

    // Démarrage du serveur
    const server = app.listen(PORT, () => {
      console.log(`🎉 Cart Service running on port ${PORT}`);
      console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
      console.log(
        `📚 API documentation: http://localhost:${PORT}/api/health/detailed`
      );
    });

    // Gestion gracieuse de l'arrêt
    const gracefulShutdown = async (signal: string): Promise<void> => {
      console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);

      server.close(async () => {
        console.log("🔌 HTTP server closed");
        console.log("✅ Graceful shutdown completed");
        process.exit(0);
      });
    };

    // Écoute des signaux d'arrêt
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  } catch (error) {
    console.error("❌ Failed to start Cart Service:", error);
    process.exit(1);
  }
}

// Démarrage du service
startService();
