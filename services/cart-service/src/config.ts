/**
 * Configuration du Cart Service
 */

import dotenv from "dotenv";
dotenv.config();

/**
 * Détection automatique de l'environnement
 */
export const isDevelopment =
  process.env["NODE_ENV"] === "development" || !process.env["DOCKER_ENV"];

/**
 * URL du Product Service selon l'environnement
 */
export const PRODUCT_SERVICE_URL = isDevelopment
  ? process.env["PRODUCT_SERVICE_URL"] || "http://localhost:3002"
  : process.env["PRODUCT_SERVICE_URL"] || "http://product-service:3002";
