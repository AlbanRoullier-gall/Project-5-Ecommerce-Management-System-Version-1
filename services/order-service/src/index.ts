/**
 * Order Service Entry Point
 * Main application setup and server startup
 *
 * Architecture : Service pattern
 * - Express application setup
 * - Database connection
 * - Automatic migrations
 * - API Router configuration
 */
import { Pool } from "pg";
import { ApiRouter } from "./api";
import runMigrations from "./migrations/migrate";

require("dotenv").config();

// Import express with require to avoid TypeScript compilation issues
const express = require("express");

const app = express();
const PORT = process.env.PORT || 3003;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

async function startService(): Promise<void> {
  try {
    console.log("🚀 Démarrage du service order-service...");
    console.log("📝 Exécution des migrations de base de données...");
    await runMigrations();
    console.log("✅ Migrations terminées avec succès");

    const apiRouter = new ApiRouter(pool);
    apiRouter.setupRoutes(app);

    app.listen(PORT, () => {
      console.log(`🚀 Order service démarré sur le port ${PORT}`);
      console.log(
        `📊 Base de données : ${
          process.env.DATABASE_URL ? "Connectée" : "Non configurée"
        }`
      );
      console.log(
        `🌍 Environnement : ${process.env.NODE_ENV || "development"}`
      );
      console.log("🎉 Service prêt à recevoir des requêtes !");
    });
  } catch (error) {
    console.error("❌ Erreur au démarrage du service:", error);
    console.error("🛑 Arrêt du service...");
    process.exit(1);
  }
}

startService();
export default app;
