/**
 * Configuration de l'API Gateway
 * Centralise les variables d'environnement et URLs des services
 */

require("dotenv").config();

// ===== VARIABLES D'ENVIRONNEMENT =====

/**
 * Détection automatique de l'environnement
 * - En Docker : utilise les noms de services Docker (product-service:3002)
 * - En développement local (start-dev.sh) : utilise localhost avec ports (localhost:3002)
 */
export const isDevelopment =
  process.env["NODE_ENV"] === "development" && !process.env["DOCKER_ENV"];

/**
 * Port du serveur API Gateway
 */
export const PORT = parseInt(process.env["PORT"] || "3020", 10);

/**
 * Secret pour la signature/vérification des tokens JWT
 */
export const JWT_SECRET = process.env["JWT_SECRET"] || "your-jwt-secret-key";

// ===== CONFIGURATION DES SERVICES =====

/**
 * Fonction helper pour obtenir l'URL d'un service
 * Priorité : Variable d'environnement > Railway private network > Nom de service Docker > localhost (dev)
 */
function getServiceUrl(
  envVar: string | undefined,
  defaultDocker: string,
  defaultDev: string,
  serviceName: string
): string {
  // Si une variable d'environnement est définie, l'utiliser en priorité
  if (envVar) {
    return envVar;
  }

  // En production (Railway), utiliser le réseau privé Railway
  if (!isDevelopment && process.env["NODE_ENV"] === "production") {
    // Railway private networking utilise : service-name.railway.internal
    // Tous les services dans le même projet Railway peuvent communiquer via ce domaine
    const port = defaultDocker.split(":").pop() || "3001";
    const railwayUrl = `http://${serviceName}.railway.internal:${port}`;
    console.log(`[Config] Railway production: ${serviceName} -> ${railwayUrl}`);
    return railwayUrl;
  }

  // Sinon, utiliser les valeurs par défaut selon l'environnement
  return isDevelopment ? defaultDev : defaultDocker;
}

/**
 * URLs des microservices selon l'environnement
 * Priorité : Variables d'environnement > Noms de services Docker > localhost (dev)
 *
 * Variables d'environnement supportées (optionnelles) :
 * - AUTH_SERVICE_URL
 * - CUSTOMER_SERVICE_URL
 * - PRODUCT_SERVICE_URL
 * - ORDER_SERVICE_URL
 * - CART_SERVICE_URL
 * - PAYMENT_SERVICE_URL
 * - EMAIL_SERVICE_URL
 * - PDF_EXPORT_SERVICE_URL
 */
export const SERVICES = {
  auth: getServiceUrl(
    process.env["AUTH_SERVICE_URL"],
    "http://auth-service:3008",
    "http://localhost:3008",
    "auth-service"
  ),
  customer: getServiceUrl(
    process.env["CUSTOMER_SERVICE_URL"],
    "http://customer-service:3001",
    "http://localhost:3001",
    "customer-service"
  ),
  product: getServiceUrl(
    process.env["PRODUCT_SERVICE_URL"],
    "http://product-service:3002",
    "http://localhost:3002",
    "product-service"
  ),
  order: getServiceUrl(
    process.env["ORDER_SERVICE_URL"],
    "http://order-service:3003",
    "http://localhost:3003",
    "order-service"
  ),
  cart: getServiceUrl(
    process.env["CART_SERVICE_URL"],
    "http://cart-service:3004",
    "http://localhost:3004",
    "cart-service"
  ),
  payment: getServiceUrl(
    process.env["PAYMENT_SERVICE_URL"],
    "http://payment-service:3007",
    "http://localhost:3007",
    "payment-service"
  ),
  email: getServiceUrl(
    process.env["EMAIL_SERVICE_URL"],
    "http://email-service:3006",
    "http://localhost:3006",
    "email-service"
  ),
  "pdf-export": getServiceUrl(
    process.env["PDF_EXPORT_SERVICE_URL"],
    "http://pdf-export-service:3040",
    "http://localhost:3040",
    "export-service"
  ),
} as const;

/**
 * Type pour les noms de services disponibles
 */
export type ServiceName = keyof typeof SERVICES;
