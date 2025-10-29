/**
 * Service de Paiement - Point d'entrée
 * Point d'entrée principal de l'application pour payment-service
 *
 * Architecture : Pattern microservice
 * - Serveur Express.js
 * - Traitement des paiements Stripe
 * - Vérifications de santé
 */

import express from "express";
import dotenv from "dotenv";
import { ApiRouter } from "./api";

// Chargement des variables d'environnement
dotenv.config();

// Configuration
const PORT = process.env.PORT || 3007;

/**
 * Fonction principale pour démarrer le service
 */
async function startService(): Promise<void> {
  try {
    console.log("🚀 Starting Payment Service...");

    // Configuration de l'application Express
    const app = express();

    // Configuration du routeur API
    const apiRouter = new ApiRouter();
    apiRouter.setupRoutes(app);

    // Démarrage du serveur
    const server = app.listen(PORT, () => {
      console.log(`🎉 Payment Service running on port ${PORT}`);
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
    console.error("❌ Failed to start Payment Service:", error);
    process.exit(1);
  }
}

// Démarrage du service
startService();
