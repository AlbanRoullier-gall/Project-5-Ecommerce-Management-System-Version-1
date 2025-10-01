/**
 * Configuration centralisée des microservices
 *
 * Ce fichier contient les URLs et configurations de tous les services backend.
 * Les valeurs peuvent être surchargées par les variables d'environnement.
 */

/**
 * Configuration d'un microservice
 */
export interface ServiceConfig {
  name: string;
  url: string;
  timeout: number;
  healthEndpoint?: string;
}

/**
 * Registre de tous les microservices
 */
export interface ServiceRegistry {
  auth: ServiceConfig;
  product: ServiceConfig;
  order: ServiceConfig;
  cart: ServiceConfig;
  customer: ServiceConfig;
  payment: ServiceConfig;
  email: ServiceConfig;
  websiteContent: ServiceConfig;
}

/**
 * Registre de configuration de tous les microservices
 */
export const servicesConfig: ServiceRegistry = {
  auth: {
    name: "auth-service",
    url: process.env["AUTH_SERVICE_URL"] || "http://localhost:13008",
    timeout: 30000,
    healthEndpoint: "/api/health",
  },
  product: {
    name: "product-service",
    url: process.env["PRODUCT_SERVICE_URL"] || "http://localhost:13002",
    timeout: 30000,
    healthEndpoint: "/api/health",
  },
  order: {
    name: "order-service",
    url: process.env["ORDER_SERVICE_URL"] || "http://localhost:13003",
    timeout: 45000, // Plus long pour les traitements de commande
    healthEndpoint: "/api/health",
  },
  cart: {
    name: "cart-service",
    url: process.env["CART_SERVICE_URL"] || "http://localhost:13004",
    timeout: 30000,
    healthEndpoint: "/health",
  },
  customer: {
    name: "customer-service",
    url: process.env["CUSTOMER_SERVICE_URL"] || "http://localhost:13001",
    timeout: 30000,
    healthEndpoint: "/api/health",
  },
  payment: {
    name: "payment-service",
    url: process.env["PAYMENT_SERVICE_URL"] || "http://localhost:13006",
    timeout: 45000, // Plus long pour les paiements
    healthEndpoint: "/api/health",
  },
  email: {
    name: "email-service",
    url: process.env["EMAIL_SERVICE_URL"] || "http://localhost:13007",
    timeout: 30000,
    healthEndpoint: "/api/health",
  },
  websiteContent: {
    name: "website-content-service",
    url: process.env["WEBSITE_CONTENT_SERVICE_URL"] || "http://localhost:13005",
    timeout: 30000,
    healthEndpoint: "/api/health",
  },
};

/**
 * Configuration globale de l'API Gateway
 */
export const gatewayConfig = {
  port: parseInt(process.env["PORT"] || "3000", 10),
  nodeEnv: process.env["NODE_ENV"] || "development",
  jwtSecret: process.env["JWT_SECRET"] || "your-jwt-secret-key",

  // CORS
  corsOrigins: [
    "http://localhost:13008", // Backoffice
    "http://localhost:13009", // Backoffice (alt)
    "http://localhost:13010", // Frontend
    "http://localhost:3000", // Dev
    "http://localhost:3001", // Dev
  ],

  // Limites
  requestTimeout: 30000,
  maxRequestSize: "10mb",

  // Logging
  logLevel: process.env["LOG_LEVEL"] || "info",
};
