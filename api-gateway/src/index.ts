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
  console.log(`   Auth: ${SERVICES.auth} ${process.env["AUTH_SERVICE_URL"] ? "(env)" : "(default)"}`);
  console.log(`   Customer: ${SERVICES.customer} ${process.env["CUSTOMER_SERVICE_URL"] ? "(env)" : "(default)"}`);
  console.log(`   Product: ${SERVICES.product} ${process.env["PRODUCT_SERVICE_URL"] ? "(env)" : "(default)"}`);
  console.log(`   Order: ${SERVICES.order} ${process.env["ORDER_SERVICE_URL"] ? "(env)" : "(default)"}`);
  console.log(`   Cart: ${SERVICES.cart} ${process.env["CART_SERVICE_URL"] ? "(env)" : "(default)"}`);
  console.log(`   Payment: ${SERVICES.payment} ${process.env["PAYMENT_SERVICE_URL"] ? "(env)" : "(default)"}`);
  console.log(`   Email: ${SERVICES.email} ${process.env["EMAIL_SERVICE_URL"] ? "(env)" : "(default)"}`);
  console.log(`   PDF Export: ${SERVICES["pdf-export"]} ${process.env["PDF_EXPORT_SERVICE_URL"] ? "(env)" : "(default)"}`);
  console.log("");
  
  // Vérification CORS
  if (process.env["ALLOWED_ORIGINS"]) {
    const origins = process.env["ALLOWED_ORIGINS"].split(",").map(o => o.trim());
    console.log(`✅ CORS: ${origins.length} origine(s) configurée(s): ${origins.join(", ")}`);
  } else {
    if (!isDevelopment) {
      console.warn("⚠️⚠️⚠️ CORS: ALLOWED_ORIGINS non configuré en PRODUCTION!");
      console.warn("⚠️⚠️⚠️ Mode permissif activé temporairement - CONFIGUREZ ALLOWED_ORIGINS dans Railway!");
    } else {
      console.log("ℹ️  CORS: Mode développement (localhost uniquement)");
    }
  }
  
  console.log("");
  console.log("💡 Tip: Si vous voyez des erreurs 500, vérifiez que tous les services sont démarrés");
  console.log("💡 Utilisez /api/health/services pour vérifier l'état des services");
  console.log("");
});
