"use strict";
/**
 * Service PDF Export - Point d'entrée
 * Point d'entrée principal de l'application pour pdf-export-service
 *
 * Architecture : Pattern microservice
 * - Serveur Express.js
 * - Génération d'exports PDF/HTML
 * - Vérifications de santé
 */
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("./api");
// Chargement des variables d'environnement
require("dotenv").config();
// Import express avec require pour éviter les problèmes de compilation TypeScript
const express = require("express");
// Configuration
const PORT = process.env.PORT || 3040;
/**
 * Fonction principale pour démarrer le service
 */
async function startService() {
    try {
        console.log("🚀 Starting PDF Export Service...");
        // Configuration de l'application Express
        const app = express();
        // Configuration du routeur API
        const apiRouter = new api_1.ApiRouter();
        apiRouter.setupRoutes(app);
        // Démarrage du serveur
        const server = app.listen(PORT, () => {
            console.log(`🎉 PDF Export Service running on port ${PORT}`);
            console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
            console.log(`📚 API documentation: http://localhost:${PORT}/api/health/detailed`);
        });
        // Gestion gracieuse de l'arrêt
        const gracefulShutdown = async (signal) => {
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
    }
    catch (error) {
        console.error("❌ Failed to start PDF Export Service:", error);
        process.exit(1);
    }
}
// Démarrage du service
startService();
//# sourceMappingURL=index.js.map