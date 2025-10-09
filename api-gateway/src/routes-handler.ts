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

// Configuration de multer pour gérer les uploads dans le gateway
const upload = multer({
  storage: multer.memoryStorage(), // Stocker en mémoire pour retransmettre
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

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

  // Route pour servir les images statiques du product-service
  app.get("/uploads/*", async (req: Request, res: Response) => {
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
  });

  // Routes spécialisées avec handlers personnalisés
  // Ces routes nécessitent une orchestration entre plusieurs services
  app.post("/api/auth/register", handleRegister);
  app.post("/api/auth/reset-password", handlePasswordReset);
  app.post("/api/auth/reset-password/confirm", handlePasswordResetConfirm);
  app.get("/api/auth/approve-backoffice", handleApproveBackofficeAccess);
  app.get("/api/auth/reject-backoffice", handleRejectBackofficeAccess);

  // Configuration automatique des routes
  // IMPORTANT: Enregistrer les routes spécifiques AVANT les routes générales avec paramètres
  const routeEntries = Object.entries(ROUTES);

  // Trier les routes pour que les routes sans paramètres soient enregistrées en premier
  const sortedRoutes = routeEntries.sort(([routeA], [routeB]) => {
    const hasParamA = routeA.includes(":");
    const hasParamB = routeB.includes(":");
    if (!hasParamA && hasParamB) return -1; // routeA avant routeB
    if (hasParamA && !hasParamB) return 1; // routeB avant routeA
    return 0; // Garder l'ordre
  });

  sortedRoutes.forEach(([route, service]) => {
    const fullRoute = `/api${route}`;
    console.log(`📝 Route enregistrée: ${fullRoute} -> ${service}`);

    // Détecter les routes d'upload d'images
    const isMultipleImageUpload = route.includes("/with-images");
    const isAddImagesToProduct = route === "/admin/products/:id/images";

    if (isMultipleImageUpload) {
      // Route pour upload multiple (créer produit avec images)
      app.post(
        fullRoute,
        upload.array("images", 10),
        async (req: Request, res: Response) => {
          await handleProxyRequest(req, res, route, service);
        }
      );
    } else if (isAddImagesToProduct) {
      // Route pour ajouter des images à un produit existant
      app.post(
        fullRoute,
        upload.array("images", 5),
        async (req: Request, res: Response) => {
          await handleProxyRequest(req, res, route, service);
        }
      );
      // Autres méthodes (GET, etc.) sans upload
      app.all(fullRoute, async (req: Request, res: Response) => {
        if (req.method === "POST") return; // Skip, déjà géré
        await handleProxyRequest(req, res, route, service);
      });
    } else {
      // Routes normales sans upload
      app.all(fullRoute, async (req: Request, res: Response) => {
        await handleProxyRequest(req, res, route, service);
      });
    }
  });
};
