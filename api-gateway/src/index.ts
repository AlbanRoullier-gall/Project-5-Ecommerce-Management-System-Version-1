/**
 * ===========================================
 * API GATEWAY - E-COMMERCE PLATFORM v2.0
 * ===========================================
 *
 * Point d'entrée central pour toutes les requêtes de l'application e-commerce.
 * Architecture refactorisée avec séparation des responsabilités.
 *
 * Architecture :
 * - Proxy centralisé vers 8 microservices
 * - Gestion d'erreurs standardisée
 * - Logging structuré avec Winston
 * - Configuration externalisée
 * - Routes modulaires par domaine
 *
 * Services connectés :
 * 1. auth-service (port 13008) : Authentification et utilisateurs
 * 2. product-service (port 13002) : Produits et catégories
 * 3. order-service (port 13003) : Gestion des commandes
 * 4. cart-service (port 13004) : Panier d'achat
 * 5. customer-service (port 13001) : Données clients
 * 6. payment-service (port 13006) : Paiements et Stripe
 * 7. email-service (port 13007) : Envoi d'emails
 * 8. website-content-service (port 13005) : Contenu du site
 *
 * @author E-commerce Platform Team
 * @version 2.0.0
 */

import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";

// Configuration
import { gatewayConfig } from "./config/services.config";

// Routes
import apiRouter from "./routes";

// Middlewares
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler";

// Logger
import logger, { logSystemEvent } from "./utils/logger";

// Chargement des variables d'environnement
dotenv.config();

// ===========================================
// INITIALISATION DE L'APPLICATION
// ===========================================

const app: Application = express();
const PORT = gatewayConfig.port;

// ===========================================
// MIDDLEWARES GLOBAUX
// ===========================================

/**
 * Sécurité avec Helmet
 */
app.use(helmet());

/**
 * Configuration CORS
 */
app.use(
  cors({
    origin: gatewayConfig.corsOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

/**
 * Parsing des requêtes
 */
app.use(express.json({ limit: gatewayConfig.maxRequestSize }));
app.use(
  express.urlencoded({ extended: true, limit: gatewayConfig.maxRequestSize })
);

/**
 * Logging des requêtes HTTP (Morgan)
 */
app.use(morgan("combined"));

// ===========================================
// MONTAGE DES ROUTES
// ===========================================

/**
 * Toutes les routes de l'API sont préfixées par /api
 */
app.use("/api", apiRouter);

/**
 * Route racine pour vérifier que le serveur fonctionne
 */
app.get("/", (_req, res) => {
  res.json({
    name: "API Gateway - E-commerce Platform",
    version: "2.0.0",
    status: "Running",
    documentation: "/api/info",
    health: "/api/health",
  });
});

// ===========================================
// GESTION DES ERREURS
// ===========================================

/**
 * Middleware pour les routes non trouvées (404)
 */
app.use(notFoundHandler);

/**
 * Middleware global de gestion des erreurs
 */
app.use(errorHandler);

// ===========================================
// DÉMARRAGE DU SERVEUR
// ===========================================

/**
 * Fonction de démarrage gracieux
 */
const startServer = async (): Promise<void> => {
  try {
    // Démarrage du serveur HTTP
    const server = app.listen(PORT, () => {
      console.log("\n╔════════════════════════════════════════════════╗");
      console.log("║   🚀 API GATEWAY v2.0 - DÉMARRÉ AVEC SUCCÈS   ║");
      console.log("╚════════════════════════════════════════════════╝\n");
      console.log(`📍 Port              : ${PORT}`);
      console.log(`🌐 URL               : http://localhost:${PORT}`);
      console.log(`🌍 Environnement     : ${gatewayConfig.nodeEnv}`);
      console.log(`📊 Log Level         : ${gatewayConfig.logLevel}`);
      console.log("\n🔗 Services Connectés:");
      console.log("   ✓ auth-service           (13008)");
      console.log("   ✓ product-service        (13002)");
      console.log("   ✓ order-service          (13003)");
      console.log("   ✓ cart-service           (13004)");
      console.log("   ✓ customer-service       (13001)");
      console.log("   ✓ payment-service        (13006)");
      console.log("   ✓ email-service          (13007)");
      console.log("   ✓ website-content-service (13005)");
      console.log("\n📚 Endpoints Disponibles:");
      console.log("   • GET  /api/health         - Health check");
      console.log("   • GET  /api/health/services - Services health");
      console.log("   • GET  /api/info           - Informations API");
      console.log("\n✅ Gateway prêt à recevoir des requêtes !\n");

      logSystemEvent("API Gateway started successfully", {
        port: PORT,
        environment: gatewayConfig.nodeEnv,
      });
    });

    // Gestion de l'arrêt gracieux
    const gracefulShutdown = (signal: string) => {
      console.log(`\n🛑 Signal ${signal} reçu. Arrêt gracieux en cours...`);
      logSystemEvent(`Shutting down due to ${signal}`);

      server.close(() => {
        console.log("✅ Serveur HTTP fermé");
        logSystemEvent("Server closed successfully");
        process.exit(0);
      });

      // Force l'arrêt après 10 secondes
      setTimeout(() => {
        console.error("⚠️  Arrêt forcé après timeout");
        process.exit(1);
      }, 10000);
    };

    // Écoute des signaux d'arrêt
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  } catch (error) {
    console.error("❌ Erreur au démarrage du serveur:", error);
    logger.error("Failed to start server", { error });
    process.exit(1);
  }
};

// Démarrer le serveur
startServer();

// Export pour les tests
export default app;
