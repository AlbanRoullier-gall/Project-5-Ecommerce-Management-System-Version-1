/**
 * Types pour le système de routing de l'API Gateway
 */

/**
 * Configuration pour les uploads de fichiers
 */
export interface UploadConfig {
  type: "single" | "multiple";
  field: string;
  maxFiles?: number;
}
