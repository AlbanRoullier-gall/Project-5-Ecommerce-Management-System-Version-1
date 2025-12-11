/**
 * Point d'entrée principal du service auth
 *
 * Architecture : Application entry point
 * - Configuration de l'application Express
 * - Connexion à la base de données
 * - Exécution automatique des migrations
 * - Démarrage du serveur
 */
import { Pool } from "pg";
import { ApiRouter } from "./api";
import runMigrations from "./migrations/migrate";

// Charger les variables d'environnement
require("dotenv").config();

// Import express avec require pour éviter les problèmes de compilation TypeScript
const express = require("express");
const app = express();
const PORT = process.env["PORT"] || 3008;

// Configuration de la base de données
const pool = new Pool({
  connectionString: process.env["DATABASE_URL"],
  ssl:
    process.env["NODE_ENV"] === "production"
      ? { rejectUnauthorized: false }
      : false,
});

/**
 * Fonction de démarrage du service avec migrations automatiques
 */
async function startService(): Promise<void> {
  try {
    console.log("🚀 Démarrage du service auth-service...");

    // Exécuter les migrations automatiquement
    console.log("📝 Exécution des migrations de base de données...");
    await runMigrations();
    console.log("✅ Migrations terminées avec succès");

    // Configuration des routes
    const apiRouter = new ApiRouter(pool);
    apiRouter.setupRoutes(app);

    // Démarrage du serveur
    app.listen(PORT, () => {
      console.log(`🚀 Auth service démarré sur le port ${PORT}`);
      console.log(
        `📊 Base de données : ${
          process.env["DATABASE_URL"] ? "Connectée" : "Non configurée"
        }`
      );
      console.log(
        `🔐 JWT Secret : ${
          process.env["JWT_SECRET"] ? "Configuré" : "Par défaut"
        }`
      );
      console.log(
        `🌍 Environnement : ${process.env["NODE_ENV"] || "development"}`
      );
      console.log("🎉 Service prêt à recevoir des requêtes !");
    });
  } catch (error) {
    console.error("❌ Erreur au démarrage du service:", error);
    console.error("🛑 Arrêt du service...");
    process.exit(1);
  }
}

// Démarrer le service
startService();

export default app;
