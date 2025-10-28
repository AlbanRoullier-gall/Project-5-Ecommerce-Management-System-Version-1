/**
 * Gestionnaire de routes pour l'API Gateway
 */

import { Request, Response } from "express";
import multer from "multer";
import axios from "axios";
import { ROUTES } from "./routes";
import { handleProxyRequest } from "./proxy";
import { SERVICES } from "./config";
import {
  handlePasswordReset,
  handlePasswordResetConfirm,
  handleRegister,
  handleApproveBackofficeAccess,
  handleRejectBackofficeAccess,
} from "./handlers/auth-handler";
import {
  handleCreatePayment,
  handleStripeWebhook,
} from "./handlers/payment-handler";
import { ExportHandler } from "./handlers/export-handler";

// ===== CONFIGURATION =====

/**
 * Configuration de multer pour gérer les uploads dans le gateway
 */
const upload = multer({
  storage: multer.memoryStorage(), // Stocker en mémoire pour retransmettre
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// ===== HELPERS PRIVÉS =====

/**
 * Détermine si une route nécessite un handler d'upload multipart
 */
const getUploadHandler = (route: string): "multiple" | "single" | null => {
  if (route.includes("/with-images")) {
    return "multiple";
  }
  if (route === "/admin/products/:id/images") {
    return "single";
  }
  return null;
};

/**
 * Trie les routes pour enregistrer les spécifiques avant les génériques
 * Routes sans paramètres (:id, :slug, etc.) sont prioritaires
 */
const sortRoutesBySpecificity = <T>(routes: [string, T][]): [string, T][] => {
  return routes.sort(([routeA], [routeB]) => {
    const hasParamA = routeA.includes(":");
    const hasParamB = routeB.includes(":");
    if (!hasParamA && hasParamB) return -1; // routeA avant routeB
    if (hasParamA && !hasParamB) return 1; // routeB avant routeA
    return 0;
  });
};

/**
 * Handler pour servir les images statiques via proxy
 */
const handleStaticImageProxy = async (req: Request, res: Response) => {
  try {
    const imagePath = req.path;
    const imageUrl = `${SERVICES.product}${imagePath}`;

    const response = await axios.get(imageUrl, {
      responseType: "stream",
    });

    // Copier les headers de réponse
    res.set("Content-Type", response.headers["content-type"]);
    res.set("Cache-Control", "public, max-age=31536000");
    res.set("Cross-Origin-Resource-Policy", "cross-origin");

    // Stream l'image
    response.data.pipe(res);
  } catch (error) {
    console.error("Erreur chargement image:", error);
    res.status(404).json({ error: "Image non trouvée" });
  }
};

/**
 * Configure toutes les routes de l'API Gateway
 */
export const setupRoutes = (app: any): void => {
  // ===== ROUTES DE BASE =====

  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({
      status: "OK",
      service: "API Gateway",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
    });
  });

  app.get("/", (_req: Request, res: Response) => {
    res.json({
      message: "API Gateway - E-commerce Platform",
      version: "1.0.0",
      health: "/api/health",
    });
  });

  // ===== ROUTES STATIQUES =====

  // Proxy des images du product-service
  app.get("/uploads/*", handleStaticImageProxy);

  // ===== ROUTES SPÉCIALISÉES =====

  // Routes nécessitant une orchestration entre plusieurs services
  app.post("/api/auth/register", handleRegister);
  app.post("/api/auth/reset-password", handlePasswordReset);
  app.post("/api/auth/reset-password/confirm", handlePasswordResetConfirm);
  app.get("/api/auth/approve-backoffice", handleApproveBackofficeAccess);
  app.get("/api/auth/reject-backoffice", handleRejectBackofficeAccess);

  // Orchestration paiement (snapshot + session Stripe)
  app.post("/api/payment/create", handleCreatePayment);

  // Webhook Stripe (raw body + signature vérifiée en handler)
  app.post("/api/webhooks/stripe", handleStripeWebhook);

  // ===== GESTION DES SNAPSHOTS CHECKOUT =====

  // Attacher un snapshot de checkout
  app.patch("/api/cart/checkout", async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.query;
      if (!sessionId) {
        res.status(400).json({ error: "sessionId is required" });
        return;
      }

      // Stocker le snapshot dans l'API Gateway
      const { checkoutSnapshots } = require("./handlers/payment-handler");
      checkoutSnapshots.set(sessionId as string, req.body);
      res.status(204).send();
    } catch (error) {
      console.error("Attach checkout snapshot error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Récupérer un snapshot de checkout
  app.get("/api/cart/checkout", async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.query;
      if (!sessionId) {
        res.status(400).json({ error: "sessionId is required" });
        return;
      }

      // Récupérer le snapshot depuis l'API Gateway
      const { checkoutSnapshots } = require("./handlers/payment-handler");
      const snapshot = checkoutSnapshots.get(sessionId as string);

      if (!snapshot) {
        res.status(404).json({ error: "Checkout snapshot not found" });
        return;
      }

      res.status(200).json({ snapshot });
    } catch (error) {
      console.error("Get checkout snapshot error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // ===== ROUTES D'EXPORT =====

  // Export des commandes par année
  const exportHandler = new ExportHandler();
  app.get(
    "/api/admin/exports/orders-year/:year",
    async (req: Request, res: Response) => {
      // Vérifier l'authentification avant de traiter la requête
      const token = req.headers["authorization"]?.replace("Bearer ", "");
      if (!token) {
        res.status(401).json({ error: "Token d'authentification requis" });
        return;
      }

      try {
        // Vérifier le token JWT
        const jwt = require("jsonwebtoken");
        const decoded = jwt.verify(
          token,
          process.env["JWT_SECRET"] || "your-jwt-secret"
        );

        // Ajouter les informations utilisateur à la requête
        (req as any).user = {
          userId: decoded.userId,
          email: decoded.email,
        };

        await exportHandler.exportOrdersYear(req, res);
      } catch (error) {
        res.status(401).json({ error: "Token d'authentification invalide" });
        return;
      }
    }
  );

  // Finalisation manuelle (dev/recovery)
  app.post(
    "/api/payment/finalize",
    require("../src/handlers/payment-handler").handleFinalizePayment
  );

  // ===== CONFIGURATION AUTOMATIQUE DES ROUTES =====

  // Trier les routes par spécificité (routes spécifiques avant génériques)
  const sortedRoutes = sortRoutesBySpecificity(Object.entries(ROUTES));

  sortedRoutes.forEach(([route, service]) => {
    const fullRoute = `/api${route}`;
    console.log(`📝 Route enregistrée: ${fullRoute} -> ${service}`);

    const uploadType = getUploadHandler(route);

    if (uploadType === "multiple") {
      // Upload multiple (ex: créer produit avec images)
      app.post(
        fullRoute,
        upload.array("images", 10),
        async (req: Request, res: Response) => {
          await handleProxyRequest(req, res, route, service);
        }
      );
    } else if (uploadType === "single") {
      // Upload simple (ex: ajouter images à un produit)
      app.post(
        fullRoute,
        upload.array("images", 5),
        async (req: Request, res: Response) => {
          await handleProxyRequest(req, res, route, service);
        }
      );
      // Autres méthodes HTTP (GET, DELETE, etc.) sans upload
      app.all(fullRoute, async (req: Request, res: Response) => {
        if (req.method === "POST") return; // Skip POST, déjà géré ci-dessus
        await handleProxyRequest(req, res, route, service);
      });
    } else {
      // Routes standards sans upload
      app.all(fullRoute, async (req: Request, res: Response) => {
        await handleProxyRequest(req, res, route, service);
      });
    }
  });
};
