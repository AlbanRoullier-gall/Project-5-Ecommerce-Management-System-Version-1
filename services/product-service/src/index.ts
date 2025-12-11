/**
 * Service Produit - Point d'entrée
 * Point d'entrée principal de l'application pour le service produit
 *
 * Architecture : Pattern Microservice
 * - Serveur Express.js
 * - Connexion à la base de données
 * - Migrations automatiques
 * - Vérifications de santé
 */

import { Pool } from "pg";
import { ApiRouter } from "./api";
import runMigrations from "./migrations/migrate";

// Charger les variables d'environnement
require("dotenv").config();

// Import express with require to avoid TypeScript compilation issues
const express = require("express");

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
    console.log("🚀 Démarrage du Service Produit...");

    // Test de connexion à la base de données
    console.log("📊 Test de connexion à la base de données...");
    await pool.query("SELECT 1");
    console.log("✅ Connexion à la base de données réussie");

    // Exécution des migrations automatiques
    console.log("🔄 Exécution des migrations de base de données...");
    await runMigrations();
    console.log("✅ Migrations de base de données terminées");

    // Configuration de l'application Express
    const app = express();

    // Configuration de l'API Router
    const apiRouter = new ApiRouter(pool);
    apiRouter.setupRoutes(app);

    // Démarrage du serveur
    const server = app.listen(PORT, () => {
      console.log(
        `🎉 Service Produit en cours d'exécution sur le port ${PORT}`
      );
      console.log(
        `📡 Vérification de santé: http://localhost:${PORT}/api/health`
      );
      console.log(
        `📚 Documentation API: http://localhost:${PORT}/api/health/detailed`
      );
    });

    // Gestion gracieuse de l'arrêt
    const gracefulShutdown = async (signal: string): Promise<void> => {
      console.log(
        `\n🛑 Signal ${signal} reçu. Démarrage de l'arrêt gracieux...`
      );

      server.close(async () => {
        console.log("🔌 Serveur HTTP fermé");

        try {
          await pool.end();
          console.log("🔌 Connexion à la base de données fermée");
          console.log("✅ Arrêt gracieux terminé");
          process.exit(0);
        } catch (error) {
          console.error("❌ Erreur lors de l'arrêt:", error);
          process.exit(1);
        }
      });
    };

    // Écoute des signaux d'arrêt
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  } catch (error) {
    console.error("❌ Échec du démarrage du Service Produit:", error);
    process.exit(1);
  }
}

// Démarrage du service
startService();
