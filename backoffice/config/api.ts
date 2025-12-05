/**
 * Configuration de l'API
 * Centralise l'URL de l'API et les types liés à l'authentification
 */

/**
 * URL de l'API centralisée
 */
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3020";

/**
 * Réexporter les types d'authentification pour compatibilité
 */
export type {
  AuthOperationResult,
  PasswordValidationResult,
} from "../services/authService";
