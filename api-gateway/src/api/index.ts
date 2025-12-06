/**
 * API Gateway - Proxy Simple
 * Fait du proxy automatique vers les services backend
 * Garde seulement les routes qui nécessitent de l'orchestration
 */

import { Application, Request, Response } from "express";
import express from "express";
import { ServiceName } from "../config";
import { proxyRequest } from "./proxy";
import { requireAuth } from "./middleware/auth";
import { requireSuperAdmin } from "./middleware/authorization";
import {
  corsMiddleware,
  helmetMiddleware,
  cookieParserMiddleware,
  notFoundHandler,
  errorHandler,
} from "./middleware/common";
import {
  handleLogin,
  handleRegister,
  handlePasswordReset,
  handlePasswordResetConfirm,
  handleVerifyAuth,
  handleLogout,
} from "./handlers/auth-handler";
import {
  handleCreatePayment,
  handleFinalizePayment,
} from "./handlers/payment-handler";
import {
  handleExportOrdersYear,
  handleExportOrderInvoice,
} from "./handlers/export-handler";
import { handleDashboardStatistics } from "./handlers/statistics-handler";
import { handleCheckoutComplete } from "./handlers/checkout-handler";
import {
  cartSessionMiddleware,
  handleCreateCartSession,
} from "./middleware/cart-session";

export class ApiRouter {
  // Multer n'est plus utilisé - les uploads utilisent maintenant base64 via DTOs

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

    // Parsing des cookies (nécessaire pour cart-session)
    app.use(cookieParserMiddleware);

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
    app.post("/api/auth/login", handleLogin);
    app.post("/api/auth/register", handleRegister);
    app.post("/api/auth/verify", handleVerifyAuth);
    app.post("/api/auth/logout", handleLogout);
    app.post("/api/auth/reset-password", handlePasswordReset);
    app.post("/api/auth/reset-password/confirm", handlePasswordResetConfirm);

    // Payment - Routes avec transformation/orchestration
    app.post("/api/payment/create", handleCreatePayment);
    // Applique le middleware cart-session pour extraire le sessionId du cookie
    app.post(
      "/api/payment/finalize",
      cartSessionMiddleware,
      handleFinalizePayment
    );

    // Checkout - Route orchestrée pour finaliser le checkout
    // Applique le middleware cart-session pour extraire le sessionId du header
    app.post(
      "/api/checkout/complete",
      cartSessionMiddleware,
      handleCheckoutComplete
    );

    // Cart Session - Route pour générer un nouveau sessionId (optionnel, le middleware le fait automatiquement)
    // Utile si on veut forcer la création d'une nouvelle session
    app.post("/api/cart/session", handleCreateCartSession);

    // Export - Routes orchestrées
    app.get(
      "/api/admin/exports/order/:id/invoice",
      requireAuth,
      handleExportOrderInvoice
    );

    app.get(
      "/api/admin/exports/orders-year/:year",
      requireAuth,
      handleExportOrdersYear
    );

    // Statistics - Route orchestrée pour le dashboard
    app.get(
      "/api/admin/statistics/dashboard",
      requireAuth,
      handleDashboardStatistics
    );

    // ===== PROXY AUTOMATIQUE POUR TOUTES LES AUTRES ROUTES =====
    // IMPORTANT: L'ordre est crucial - les routes spécifiques doivent être enregistrées AVANT les routes génériques

    // Routes de gestion des utilisateurs (SUPER ADMIN UNIQUEMENT)
    // Doivent être AVANT la route générique /api/admin/*
    app.get(
      "/api/admin/users/pending",
      requireAuth,
      requireSuperAdmin,
      async (req, res) => {
        await proxyRequest(req, res, "auth");
      }
    );

    app.get(
      "/api/admin/users",
      requireAuth,
      requireSuperAdmin,
      async (req, res) => {
        await proxyRequest(req, res, "auth");
      }
    );

    app.get(
      "/api/admin/users/:id",
      requireAuth,
      requireSuperAdmin,
      async (req, res) => {
        await proxyRequest(req, res, "auth");
      }
    );

    app.post(
      "/api/admin/users/:id/approve",
      requireAuth,
      requireSuperAdmin,
      async (req, res) => {
        await proxyRequest(req, res, "auth");
      }
    );

    app.post(
      "/api/admin/users/:id/reject",
      requireAuth,
      requireSuperAdmin,
      async (req, res) => {
        await proxyRequest(req, res, "auth");
      }
    );

    app.delete(
      "/api/admin/users/:id",
      requireAuth,
      requireSuperAdmin,
      async (req, res) => {
        await proxyRequest(req, res, "auth");
      }
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

    // Route spécifique pour créer un produit
    // Le backoffice utilise maintenant JSON avec DTOs (plus de FormData)
    // Doit être avant la route générique /api/admin/*
    app.post(
      "/api/admin/products",
      requireAuth,
      // Plus besoin de multer, on utilise JSON uniquement
      async (req, res) => {
        // Proxy normal vers le service (JSON uniquement)
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
    // Appliquer le middleware cart-session pour les routes /api/cart
    app.all("/api/cart*", cartSessionMiddleware, async (req, res) => {
      const service = this.getServiceFromPath(req.path);
      if (service) {
        await proxyRequest(req, res, service);
      } else {
        res.status(404).json({ error: "Service non trouvé pour cette route" });
      }
    });

    // Autres routes publiques (sans middleware cart-session)
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
