/**
 * Configuration du Cart Service
 */

import dotenv from "dotenv";
dotenv.config();

/**
 * Détection automatique de l'environnement
 * En Docker, on utilise toujours les noms de services Docker
 * Si on est dans un conteneur Docker, on utilise le nom du service
 */
const isInDocker =
  process.env["DOCKER_ENV"] === "true" ||
  process.env["NODE_ENV"] !== "development" ||
  // Détection automatique : si on peut résoudre le nom du service Docker
  typeof process.env["HOSTNAME"] !== "undefined";

/**
 * URL de l'API Gateway selon l'environnement
 * Le cart-service communique avec les autres services via l'API Gateway
 * - En développement local : localhost:3020
 * - En Docker : api-gateway:3020 (nom du service Docker)
 */
export const API_GATEWAY_URL =
  process.env["API_GATEWAY_URL"] ||
  (isInDocker ? "http://api-gateway:3020" : "http://localhost:3020");
