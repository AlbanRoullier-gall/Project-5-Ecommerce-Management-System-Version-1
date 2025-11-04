/**
 * Middlewares de sécurité
 */

import { RequestHandler } from "express";
import cors from "cors";
import helmet from "helmet";

/**
 * Configuration CORS
 */
export const corsMiddleware: RequestHandler = cors({
  origin: true,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
  ],
});

/**
 * Configuration Helmet pour la sécurité HTTP
 */
export const helmetMiddleware: RequestHandler = helmet({
  crossOriginResourcePolicy: false,
});
