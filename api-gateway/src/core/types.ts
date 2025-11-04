/**
 * Types pour la configuration des routes
 */

import { Request, Response } from "express";
import { ServiceName } from "../config";

/**
 * Configuration pour les uploads de fichiers
 */
export interface UploadConfig {
  type: "single" | "multiple";
  field: string;
  maxFiles?: number | undefined;
  maxSize?: number | undefined; // en bytes
}

/**
 * Route simple - Proxy direct vers un service
 */
export interface SimpleRoute {
  path: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "ALL";
  service: ServiceName;
  auth?: boolean; // true si nécessite authentification, false par défaut
  upload?: UploadConfig;
}

/**
 * Route orchestrée - Utilise un handler custom
 */
export interface OrchestratedRoute {
  path: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "ALL";
  handler: (req: Request, res: Response) => Promise<void> | void;
  auth?: boolean;
  middlewares?: Array<(req: Request, res: Response, next: () => void) => void>;
}

/**
 * Route statique - Pour les fichiers statiques
 */
export interface StaticRoute {
  path: string;
  handler: (req: Request, res: Response) => Promise<void> | void;
}

/**
 * Union type pour toutes les routes
 */
export type RouteConfig = SimpleRoute | OrchestratedRoute | StaticRoute;

/**
 * Collection de routes par type
 */
export interface RouteCollection {
  simple: SimpleRoute[];
  orchestrated: OrchestratedRoute[];
  static: StaticRoute[];
}
