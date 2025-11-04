/**
 * Types pour le système de routing de l'API Gateway
 */

import { Request, Response } from "express";
import { ServiceName } from "../config";

/**
 * Configuration pour les uploads de fichiers
 */
export interface UploadConfig {
  type: "single" | "multiple";
  field: string;
  maxFiles?: number;
}

/**
 * Route unifiée - Un seul type pour toutes les routes
 */
export interface Route {
  path: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "ALL";
  // Si handler présent = route orchestrée, sinon = proxy vers service
  handler?: (req: Request, res: Response) => Promise<void> | void;
  service?: ServiceName; // Nécessaire si pas de handler
  // Options (par défaut basées sur conventions)
  auth?: boolean; // Si non défini, détecté automatiquement depuis path
  upload?: UploadConfig; // Si non défini, détecté automatiquement depuis path
}
