/**
 * API GATEWAY - PROXY SIMPLE
 *
 * Architecture simplifiée - Proxy automatique
 * - Proxy automatique vers les services backend
 * - Handlers spéciaux uniquement pour l'orchestration (auth, payment, export)
 * - Détection automatique du service à partir du chemin de la route
 */

require("dotenv").config();

const express = require("express");
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
  console.log("");
  console.log("🔗 Services URLs:");
  console.log(`   Auth: ${SERVICES.auth}`);
  console.log(`   Customer: ${SERVICES.customer}`);
  console.log(`   Product: ${SERVICES.product}`);
  console.log(`   Order: ${SERVICES.order}`);
  console.log(`   Cart: ${SERVICES.cart}`);
  console.log(`   Payment: ${SERVICES.payment}`);
  console.log(`   Email: ${SERVICES.email}`);
  console.log(`   PDF Export: ${SERVICES["pdf-export"]}`);
  console.log("");
});
