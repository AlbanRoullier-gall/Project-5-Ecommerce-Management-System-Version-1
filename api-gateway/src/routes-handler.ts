/**
 * Gestionnaire de routes pour l'API Gateway
 */

import { Request, Response } from "express";
import { ROUTES } from "./routes";
import { handleProxyRequest } from "./proxy";

/**
 * Configure toutes les routes de l'API Gateway
 */
export const setupRoutes = (app: any): void => {
  // Route de santé
  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({
      status: "OK",
      service: "API Gateway",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
    });
  });

  // Route racine
  app.get("/", (_req: Request, res: Response) => {
    res.json({
      message: "API Gateway - E-commerce Platform",
      version: "1.0.0",
      health: "/api/health",
    });
  });

  // Configuration automatique des routes
  Object.entries(ROUTES).forEach(([route, service]) => {
    const fullRoute = `/api${route}`;
    console.log(`📝 Route enregistrée: ${fullRoute} -> ${service}`);

    app.all(fullRoute, async (req: Request, res: Response) => {
      await handleProxyRequest(req, res, route, service);
    });
  });
};
