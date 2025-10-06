/**
 * Product Service - Entry Point
 * Main application entry point for product-service
 *
 * Architecture : Microservice pattern
 * - Express.js server
 * - Database connection
 * - Automatic migrations
 * - Health checks
 */

import express from "express";
import { Pool } from "pg";
import dotenv from "dotenv";
import { ApiRouter } from "./api";
import runMigrations from "./migrations/migrate";

// Load environment variables
dotenv.config();

// Configuration
const PORT = process.env.PORT || 3002;

/**
 * Configuration de la connexion à la base de données PostgreSQL
 * SSL activé en production pour la sécurité
 */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

/**
 * Fonction principale pour démarrer le service
 */
async function startService(): Promise<void> {
  try {
    console.log("🚀 Starting Product Service...");

    // Test de connexion à la base de données
    console.log("📊 Testing database connection...");
    await pool.query("SELECT 1");
    console.log("✅ Database connection successful");

    // Exécution des migrations automatiques
    console.log("🔄 Running database migrations...");
    await runMigrations();
    console.log("✅ Database migrations completed");

    // Configuration de l'application Express
    const app = express();

    // Configuration de l'API Router
    const apiRouter = new ApiRouter(pool);
    apiRouter.setupRoutes(app);

    // Démarrage du serveur
    const server = app.listen(PORT, () => {
      console.log(`🎉 Product Service running on port ${PORT}`);
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

        try {
          await pool.end();
          console.log("🔌 Database connection closed");
          console.log("✅ Graceful shutdown completed");
          process.exit(0);
        } catch (error) {
          console.error("❌ Error during shutdown:", error);
          process.exit(1);
        }
      });
    };

    // Écoute des signaux d'arrêt
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  } catch (error) {
    console.error("❌ Failed to start Product Service:", error);
    process.exit(1);
  }
}

// Démarrage du service
startService();
