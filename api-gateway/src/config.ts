/**
 * Configuration de l'API Gateway
 */

// Configuration automatique selon l'environnement
export const isDevelopment =
  process.env["NODE_ENV"] === "development" || !process.env["DOCKER_ENV"];

export const PORT = parseInt(process.env["PORT"] || "3020", 10);
export const JWT_SECRET = process.env["JWT_SECRET"] || "your-jwt-secret-key";

// Configuration des services
export const SERVICES = {
  auth: isDevelopment ? "http://localhost:3008" : "http://auth-service:3008",
  product: isDevelopment
    ? "http://localhost:3002"
    : "http://product-service:3002",
  order: isDevelopment ? "http://localhost:3003" : "http://order-service:3003",
  cart: isDevelopment ? "http://localhost:3004" : "http://cart-service:3004",
  customer: isDevelopment
    ? "http://localhost:3001"
    : "http://customer-service:3001",
  payment: isDevelopment
    ? "http://localhost:3007"
    : "http://payment-service:3007",
  email: isDevelopment ? "http://localhost:3006" : "http://email-service:3006",
  "website-content": isDevelopment
    ? "http://localhost:3005"
    : "http://website-content-service:3005",
} as const;

export type ServiceName = keyof typeof SERVICES;
