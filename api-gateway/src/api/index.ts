/**
 * API Gateway - Proxy Simple
 * Fait du proxy automatique vers les services backend
 * Garde seulement les routes qui nécessitent de l'orchestration
 */

import { Application, Request, Response } from "express";
import express from "express";
import multer from "multer";
import FormData from "form-data";
import axios from "axios";
import { ServiceName, SERVICES } from "../config";
import { proxyRequest } from "./proxy";
import { requireAuth } from "./middleware/auth";
import {
  corsMiddleware,
  helmetMiddleware,
  notFoundHandler,
  errorHandler,
} from "./middleware/common";
import {
  handleRegister,
  handlePasswordReset,
  handlePasswordResetConfirm,
  handleApproveBackofficeAccess,
  handleRejectBackofficeAccess,
} from "./handlers/auth-handler";
import {
  handleCreatePayment,
  handleFinalizePayment,
} from "./handlers/payment-handler";
import { handleExportOrdersYear } from "./handlers/export-handler";

export class ApiRouter {
  private upload: multer.Multer;

  constructor() {
    this.upload = multer({
      storage: multer.memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    });
  }

  private getServiceFromPath(path: string): ServiceName | null {
    if (path.startsWith("/api/auth")) return "auth";
    if (
      path.startsWith("/api/products") ||
      path.startsWith("/api/categories") ||
      path.startsWith("/api/images") ||
      path.startsWith("/api/admin/products") ||
      path.startsWith("/api/admin/categories") ||
      path.startsWith("/uploads")
    )
      return "product";
    if (
      path.startsWith("/api/orders") ||
      path.startsWith("/api/admin/orders") ||
      path.startsWith("/api/admin/order-") ||
      path.startsWith("/api/admin/credit-") ||
      path.startsWith("/api/admin/statistics") ||
      (path.startsWith("/api/customers/") && path.includes("/credit-notes"))
    )
      return "order";
    if (path.startsWith("/api/cart")) return "cart";
    if (
      path.startsWith("/api/customers") ||
      path.startsWith("/api/admin/customers")
    )
      return "customer";
    if (path.startsWith("/api/payment")) return "payment";
    if (path.startsWith("/api/email")) return "email";
    if (
      path.startsWith("/api/admin/export") ||
      path.startsWith("/api/admin/exports")
    )
      return "pdf-export";
    return null;
  }

  /**
   * Configuration des middlewares globaux
   */
  private setupMiddlewares(app: express.Application): void {
    // Sécurité
    app.use(corsMiddleware);
    app.use(helmetMiddleware);

    // Parsing du body (Express gère déjà le Content-Type automatiquement)
    app.use(express.json({ limit: "10mb" }));
    app.use(express.urlencoded({ extended: true }));
  }

  setupRoutes(app: Application): void {
    this.setupMiddlewares(app);

    // ===== ROUTES DE BASE =====
    app.get("/api/health", (_req: Request, res: Response) => {
      res.json({
        status: "OK",
        service: "API Gateway",
        timestamp: new Date().toISOString(),
        version: "3.0.0",
      });
    });

    app.get("/", (_req: Request, res: Response) => {
      res.json({
        message: "API Gateway - E-commerce Platform",
        version: "3.0.0",
        health: "/api/health",
      });
    });

    // ===== ROUTES AVEC ORCHESTRATION (handlers spéciaux) =====

    // Auth - Routes orchestrées
    app.post("/api/auth/register", handleRegister);
    app.post("/api/auth/reset-password", handlePasswordReset);
    app.post("/api/auth/reset-password/confirm", handlePasswordResetConfirm);
    app.get("/api/auth/approve-backoffice", handleApproveBackofficeAccess);
    app.get("/api/auth/reject-backoffice", handleRejectBackofficeAccess);

    // Payment - Routes avec transformation/orchestration
    app.post("/api/payment/create", handleCreatePayment);
    app.post("/api/payment/finalize", handleFinalizePayment);

    // Export - Route orchestrée
    app.get(
      "/api/admin/exports/orders-year/:year",
      requireAuth,
      handleExportOrdersYear
    );

    // ===== PROXY AUTOMATIQUE POUR TOUTES LES AUTRES ROUTES =====
    // IMPORTANT: L'ordre est crucial - les routes spécifiques doivent être enregistrées AVANT les routes génériques

    // Routes avec uploads spécifiques (AVANT les routes génériques)
    app.post(
      "/api/admin/products/with-images",
      requireAuth,
      this.upload.array("images", 10),
      (req, res) => proxyRequest(req, res, "product")
    );
    app.post(
      "/api/admin/products/:id/images",
      requireAuth,
      this.upload.array("images", 5),
      (req, res) => proxyRequest(req, res, "product")
    );

    // Routes admin spécifiques avec paramètres (AVANT la route générique /api/admin/*)
    app.post("/api/admin/products/:id/activate", requireAuth, (req, res) =>
      proxyRequest(req, res, "product")
    );
    app.post("/api/admin/products/:id/deactivate", requireAuth, (req, res) =>
      proxyRequest(req, res, "product")
    );
    app.get("/api/admin/products/:id/images", requireAuth, (req, res) =>
      proxyRequest(req, res, "product")
    );
    app.delete(
      "/api/admin/products/:id/images/:imageId",
      requireAuth,
      (req, res) => proxyRequest(req, res, "product")
    );

    // Route spécifique pour créer un produit (avec ou sans images)
    // Doit être avant la route générique /api/admin/*
    app.post(
      "/api/admin/products",
      requireAuth,
      this.upload.any(), // Parse FormData si présent, sinon passe à travers
      async (req, res) => {
        // Détecter si c'est un FormData (multipart) en vérifiant si multer a parsé des champs
        // ou si des fichiers sont présents
        const isFormData =
          req.headers["content-type"]?.includes("multipart/form-data") ||
          (req.files && Array.isArray(req.files) && req.files.length > 0) ||
          (req.body &&
            typeof req.body === "object" &&
            "name" in req.body &&
            !("product" in req.body));

        if (isFormData) {
          // Construire l'objet produit depuis le FormData
          const productData: any = {};
          if (req.body.name) productData.name = req.body.name;
          if (req.body.description !== undefined)
            productData.description = req.body.description;
          if (req.body.price) productData.price = parseFloat(req.body.price);
          if (req.body.vatRate)
            productData.vatRate = parseFloat(req.body.vatRate);
          if (req.body.categoryId)
            productData.categoryId = parseInt(req.body.categoryId);
          if (req.body.isActive !== undefined)
            productData.isActive =
              req.body.isActive === "true" || req.body.isActive === true;

          // Si des images sont présentes, utiliser la route with-images
          if (req.files && Array.isArray(req.files) && req.files.length > 0) {
            // Construire un FormData pour la route with-images
            const formData = new FormData();
            formData.append("product", JSON.stringify(productData));
            req.files.forEach((file: Express.Multer.File) => {
              formData.append("images", file.buffer, {
                filename: file.originalname,
                contentType: file.mimetype,
              });
            });

            // Faire le proxy vers /api/admin/products/with-images
            const serviceUrl = SERVICES["product"];
            const targetUrl = `${serviceUrl}/api/admin/products/with-images`;
            const headers: Record<string, string> = {
              Authorization: req.headers.authorization || "",
              ...formData.getHeaders(),
            };
            if ((req as any).user) {
              const user = (req as any).user;
              headers["x-user-id"] = String(user.userId);
              headers["x-user-email"] = user.email;
            }

            try {
              const response = await axios.post(targetUrl, formData, {
                headers,
                timeout: 60000,
                maxBodyLength: Infinity,
                maxContentLength: Infinity,
              });
              res.status(response.status).json(response.data);
            } catch (error: any) {
              if (error.response) {
                res.status(error.response.status).json(error.response.data);
              } else {
                res.status(500).json({
                  error: "Service Error",
                  message: "Erreur de communication avec le service",
                });
              }
            }
            return;
          }

          // Pas d'images, convertir le FormData en JSON et envoyer
          req.body = productData;
          // Changer le Content-Type pour JSON
          req.headers["content-type"] = "application/json";
        }

        // Proxy normal vers le service
        await proxyRequest(req, res, "product");
      }
    );

    // Routes admin génériques (doivent être après les routes spécifiques)
    app.all("/api/admin/*", requireAuth, async (req, res) => {
      const service = this.getServiceFromPath(req.path);
      if (service) {
        await proxyRequest(req, res, service);
      } else {
        res.status(404).json({ error: "Service non trouvé pour cette route" });
      }
    });

    // Routes publiques - Proxy automatique
    app.all("/api/*", async (req, res) => {
      const service = this.getServiceFromPath(req.path);
      if (service) {
        await proxyRequest(req, res, service);
      } else {
        res.status(404).json({ error: "Service non trouvé pour cette route" });
      }
    });

    // Route statique pour les images (sans préfixe /api)
    app.get("/uploads/*", (req, res) => proxyRequest(req, res, "product"));

    // ===== GESTION DES ERREURS =====
    app.use(notFoundHandler);
    app.use(errorHandler);
  }
}
