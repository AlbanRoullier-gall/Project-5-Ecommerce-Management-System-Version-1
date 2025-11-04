/**
 * Router simplifié pour l'API Gateway
 * Gère uniquement l'enregistrement des routes
 */

import { Application, Request, Response } from "express";
import { requireAuth } from "../auth";
import { Route } from "./types";
import { needsAuth, getUploadConfig, shouldSkipApiPrefix } from "./conventions";
import { createUploadMiddleware } from "./uploads";
import { proxyRequest } from "./proxy";

/**
 * Enregistre une route avec conventions automatiques
 * Une seule fonction pour tous les types de routes
 */
const registerRoute = (app: Application, route: Route): void => {
  // Construire le chemin complet (convention automatique)
  const fullPath = shouldSkipApiPrefix(route.path)
    ? route.path
    : `/api${route.path}`;

  // Détecter automatiquement auth et upload via conventions
  const auth = needsAuth(route.path, route.auth);
  const upload = getUploadConfig(route.path, route.method, route.upload);

  // Construire les middlewares dans l'ordre
  const middlewares: any[] = [];

  // 1. Authentification (convention ou explicite)
  if (auth) {
    middlewares.push(requireAuth);
  }

  // 2. Upload (convention ou explicite)
  if (upload) {
    middlewares.push(
      createUploadMiddleware(upload.type, upload.field, upload.maxFiles)
    );
  }

  // 3. Handler (orchestrée ou proxy)
  if (route.handler) {
    // Route orchestrée avec handler custom
    middlewares.push(async (req: Request, res: Response) => {
      await route.handler!(req, res);
    });
  } else if (route.service) {
    // Route simple avec proxy
    middlewares.push(async (req: Request, res: Response) => {
      await proxyRequest(req, res, route.service!);
    });
  } else {
    throw new Error(`Route ${route.path} doit avoir soit handler soit service`);
  }

  // Enregistrer la route
  if (route.method === "ALL") {
    app.all(fullPath, ...middlewares);
  } else {
    (app as any)[route.method.toLowerCase()](fullPath, ...middlewares);
  }

  const routeType = route.handler ? "orchestrée" : "simple";
  console.log(`📝 Route ${routeType}: ${route.method} ${fullPath}`);
};

/**
 * Configure toutes les routes de l'API Gateway
 * Une seule boucle pour toutes les routes
 */
export const setupRoutes = (app: Application, routes: Route[]): void => {
  // Routes de base
  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({
      status: "OK",
      service: "API Gateway",
      timestamp: new Date().toISOString(),
      version: "2.2.0",
    });
  });

  app.get("/", (_req: Request, res: Response) => {
    res.json({
      message: "API Gateway - E-commerce Platform",
      version: "2.2.0",
      health: "/api/health",
    });
  });

  // Trier les routes par spécificité (sans paramètres avant avec paramètres)
  const sortedRoutes = [...routes].sort((a, b) => {
    const hasParamA = a.path.includes(":");
    const hasParamB = b.path.includes(":");
    if (!hasParamA && hasParamB) return -1;
    if (hasParamA && !hasParamB) return 1;
    return 0;
  });

  // Une seule boucle pour toutes les routes
  sortedRoutes.forEach((route) => registerRoute(app, route));

  console.log("\n✅ Toutes les routes ont été enregistrées\n");
};
