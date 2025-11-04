/**
 * Router principal pour l'API Gateway
 * Gère le routing avec un pipeline clair et prévisible
 */

import { Application, Request, Response } from "express";
import multer from "multer";
import { requireAuth } from "../auth";
import { proxyRequest } from "./proxy";
import { RouteCollection, SimpleRoute, OrchestratedRoute } from "./types";

/**
 * Configuration de multer pour gérer les uploads
 */
const createUploadMiddleware = (
  type: "single" | "multiple",
  field: string,
  maxFiles?: number
) => {
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  });

  if (type === "multiple") {
    return upload.array(field, maxFiles || 10);
  }
  return upload.single(field);
};

/**
 * Enregistre une route (simple, orchestrée ou statique)
 * Fonction unifiée pour tous les types de routes
 */
const registerRoute = (
  app: Application,
  route: SimpleRoute | OrchestratedRoute,
  skipApiPrefix: boolean = false
): void => {
  // Les routes statiques (comme /uploads/*) ne doivent pas avoir le préfixe /api
  const fullPath =
    skipApiPrefix || route.path.startsWith("/api")
      ? route.path
      : `/api${route.path}`;
  const middlewares: any[] = [];

  // 1. Middlewares personnalisés (pour routes orchestrées)
  if ("middlewares" in route && route.middlewares) {
    middlewares.push(...route.middlewares);
  }

  // 2. Authentification si nécessaire
  if (route.auth) {
    middlewares.push(requireAuth);
  }

  // 3. Upload si nécessaire (pour routes simples)
  if ("upload" in route && route.upload) {
    middlewares.push(
      createUploadMiddleware(
        route.upload.type,
        route.upload.field,
        route.upload.maxFiles
      )
    );
  }

  // 4. Handler
  if ("handler" in route) {
    // Route orchestrée avec handler custom
    middlewares.push(async (req: Request, res: Response) => {
      await route.handler(req, res);
    });
  } else {
    // Route simple avec proxy
    middlewares.push(async (req: Request, res: Response) => {
      await proxyRequest(req, res, route.service);
    });
  }

  // Enregistrer la route selon la méthode
  if (route.method === "ALL") {
    app.all(fullPath, ...middlewares);
  } else {
    (app as any)[route.method.toLowerCase()](fullPath, ...middlewares);
  }

  const routeType = "handler" in route ? "orchestrée" : "simple";
  console.log(`📝 Route ${routeType}: ${route.method} ${fullPath}`);
};

/**
 * Configure toutes les routes de l'API Gateway
 */
export const setupRoutes = (
  app: Application,
  routes: RouteCollection
): void => {
  // ===== ROUTES DE BASE =====
  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({
      status: "OK",
      service: "API Gateway",
      timestamp: new Date().toISOString(),
      version: "2.0.0",
    });
  });

  app.get("/", (_req: Request, res: Response) => {
    res.json({
      message: "API Gateway - E-commerce Platform",
      version: "2.0.0",
      health: "/api/health",
    });
  });

  // ===== ROUTES ORCHESTRÉES =====
  // Routes avec orchestration (doivent être enregistrées avant les routes simples
  // pour éviter les conflits de matching)
  routes.orchestrated.forEach((route) => registerRoute(app, route));

  // ===== ROUTES STATIQUES =====
  // Routes statiques sont traitées comme des routes orchestrées avec handler
  // IMPORTANT: Les routes statiques ne doivent PAS avoir le préfixe /api
  routes.static.forEach((route) => {
    const staticRoute: OrchestratedRoute = {
      path: route.path,
      method: "GET",
      handler: route.handler,
      auth: false,
    };
    registerRoute(app, staticRoute, true); // skipApiPrefix = true
  });

  // ===== ROUTES SIMPLES =====
  // Trier les routes simples par spécificité (sans paramètres avant avec paramètres)
  const sortedSimpleRoutes = [...routes.simple].sort((a, b) => {
    const hasParamA = a.path.includes(":");
    const hasParamB = b.path.includes(":");
    if (!hasParamA && hasParamB) return -1;
    if (hasParamA && !hasParamB) return 1;
    return 0;
  });

  sortedSimpleRoutes.forEach((route) => registerRoute(app, route));

  console.log("\n✅ Toutes les routes ont été enregistrées\n");
};
