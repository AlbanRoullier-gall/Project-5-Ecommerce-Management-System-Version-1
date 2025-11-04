/**
 * Configuration de l'API Gateway
 * Centralise les variables d'environnement et URLs des services
 */

import dotenv from "dotenv";
dotenv.config();

// ===== VARIABLES D'ENVIRONNEMENT =====

/**
 * Détection automatique de l'environnement
 */
export const isDevelopment =
  process.env["NODE_ENV"] === "development" || !process.env["DOCKER_ENV"];

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
 * URLs des microservices selon l'environnement
 * Development: localhost avec ports spécifiques
 * Docker: noms de containers
 */
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
  "pdf-export": isDevelopment
    ? "http://localhost:3040"
    : "http://pdf-export-service:3040",
} as const;

/**
 * Type pour les noms de services disponibles
 */
export type ServiceName = keyof typeof SERVICES;
