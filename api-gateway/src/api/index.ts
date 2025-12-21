/**
 * API Gateway - Proxy Simple
 * Fait du proxy automatique vers les services backend
 * Garde seulement les routes qui nécessitent de l'orchestration
 */

import { Request, Response, NextFunction } from "express";
import { ServiceName, SERVICES } from "../config";
import { proxyRequest } from "./proxy";
import axios from "axios";
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
  getProductsRateLimit,
  getStaticRateLimit,
  postPutRateLimit,
  deleteRateLimit,
  authLoginRateLimit,
  authRegisterRateLimit,
  authPasswordResetRateLimit,
  paymentRateLimit,
} from "./middleware/rate-limiting";
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
import { handleCheckStock } from "./handlers/stock-handler";
import {
  cartSessionMiddleware,
  handleCreateCartSession,
} from "./middleware/cart-session";
const express = require("express");

export class ApiRouter {
  private getServiceFromPath(path: string): ServiceName | null {
    if (path.startsWith("/api/auth")) return "auth";
    if (
      path.startsWith("/api/products") ||
      path.startsWith("/api/categories") ||
      path.startsWith("/api/images") ||
      path.startsWith("/api/admin/products") ||
      path.startsWith("/api/admin/categories")
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
  private setupMiddlewares(app: any): void {
    // Sécurité
    app.use(corsMiddleware);
    app.use(helmetMiddleware);

    // Parsing des cookies (nécessaire pour cart-session)
    app.use(cookieParserMiddleware);

    // Parsing du body (Express gère déjà le Content-Type automatiquement)
    app.use(express.json({ limit: "10mb" }));
    app.use(express.urlencoded({ extended: true }));

    // Rate limiting par type de requête - appliqué de manière sélective sur les routes
    // Plus de rate limiting global, chaque route a son propre middleware
  }

  setupRoutes(app: any): void {
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

    // Endpoint de diagnostic pour vérifier l'état des services
    // IMPORTANT: Cette route doit être définie AVANT la route générique /api/*
    app.get("/api/health/services", async (_req: Request, res: Response) => {
      console.log("[Health Services] Endpoint appelé");
      const servicesStatus: Record<string, any> = {};
      const serviceNames: ServiceName[] = [
        "auth",
        "customer",
        "product",
        "order",
        "cart",
        "payment",
        "email",
        "pdf-export",
      ];

      // Vérifier chaque service
      for (const serviceName of serviceNames) {
        const serviceUrl = SERVICES[serviceName];
        const healthUrl = `${serviceUrl}/api/health`;

        try {
          const response = await axios.get(healthUrl, {
            timeout: 5000,
            validateStatus: () => true, // Accepter tous les codes de statut
          });

          servicesStatus[serviceName] = {
            url: serviceUrl,
            status: response.status === 200 ? "OK" : "ERROR",
            httpStatus: response.status,
            responseTime: response.headers["x-response-time"] || "N/A",
            timestamp: new Date().toISOString(),
          };
        } catch (error: any) {
          servicesStatus[serviceName] = {
            url: serviceUrl,
            status: "UNAVAILABLE",
            error: error.code || "UNKNOWN",
            message: error.message || "Service non accessible",
            timestamp: new Date().toISOString(),
          };
        }
      }

      const allServicesOk = Object.values(servicesStatus).every(
        (status: any) => status.status === "OK"
      );

      res.status(allServicesOk ? 200 : 503).json({
        gateway: "OK",
        timestamp: new Date().toISOString(),
        services: servicesStatus,
        summary: {
          total: serviceNames.length,
          ok: Object.values(servicesStatus).filter(
            (s: any) => s.status === "OK"
          ).length,
          unavailable: Object.values(servicesStatus).filter(
            (s: any) => s.status === "UNAVAILABLE"
          ).length,
        },
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

    // Auth - Routes orchestrées avec rate limiting strict
    app.post("/api/auth/login", authLoginRateLimit, handleLogin);
    app.post("/api/auth/register", authRegisterRateLimit, handleRegister);
    app.post("/api/auth/verify", handleVerifyAuth);
    app.post("/api/auth/logout", handleLogout);
    app.post(
      "/api/auth/reset-password",
      authPasswordResetRateLimit,
      handlePasswordReset
    );
    app.post(
      "/api/auth/reset-password/confirm",
      authPasswordResetRateLimit,
      handlePasswordResetConfirm
    );

    // Payment - Routes avec transformation/orchestration
    app.post(
      "/api/payment/create",
      requireAuth,
      paymentRateLimit,
      handleCreatePayment
    );
    // Applique le middleware cart-session pour extraire le sessionId du cookie
    // NOTE: Pas de requireAuth car les clients peuvent finaliser un paiement sans être connectés
    // L'authentification se fait via la session Stripe et le cartSessionId
    console.log(
      "[API Gateway] Enregistrement de la route /api/payment/finalize"
    );
    app.post(
      "/api/payment/finalize",
      (req: Request, _res: Response, next: NextFunction) => {
        console.log(
          `[API Gateway] ✅ Route spécifique /api/payment/finalize interceptée - méthode: ${req.method}, path: ${req.path}`
        );
        next();
      },
      cartSessionMiddleware,
      paymentRateLimit,
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

    // Stock - Route orchestrée pour vérifier le stock (utilisée par cart-service)
    app.get("/api/stock/check/:productId", handleCheckStock);

    // ===== PROXY AUTOMATIQUE POUR TOUTES LES AUTRES ROUTES =====
    // IMPORTANT: L'ordre est crucial - les routes spécifiques doivent être enregistrées AVANT les routes génériques

    // Routes de gestion des utilisateurs (SUPER ADMIN UNIQUEMENT)
    // Doivent être AVANT la route générique /api/admin/*
    app.get(
      "/api/admin/users/pending",
      requireAuth,
      requireSuperAdmin,
      async (req: Request, res: Response) => {
        await proxyRequest(req, res, "auth");
      }
    );

    app.get(
      "/api/admin/users",
      requireAuth,
      requireSuperAdmin,
      async (req: Request, res: Response) => {
        await proxyRequest(req, res, "auth");
      }
    );

    app.get(
      "/api/admin/users/:id",
      requireAuth,
      requireSuperAdmin,
      async (req: Request, res: Response) => {
        await proxyRequest(req, res, "auth");
      }
    );

    app.post(
      "/api/admin/users/:id/approve",
      requireAuth,
      requireSuperAdmin,
      postPutRateLimit,
      async (req: Request, res: Response) => {
        await proxyRequest(req, res, "auth");
      }
    );

    app.post(
      "/api/admin/users/:id/reject",
      requireAuth,
      requireSuperAdmin,
      postPutRateLimit,
      async (req: Request, res: Response) => {
        await proxyRequest(req, res, "auth");
      }
    );

    app.delete(
      "/api/admin/users/:id",
      requireAuth,
      requireSuperAdmin,
      deleteRateLimit,
      async (req: Request, res: Response) => {
        await proxyRequest(req, res, "auth");
      }
    );

    // Routes admin spécifiques avec paramètres (AVANT la route générique /api/admin/*)
    app.post(
      "/api/admin/products/:id/activate",
      requireAuth,
      postPutRateLimit,
      (req: Request, res: Response) => proxyRequest(req, res, "product")
    );
    app.post(
      "/api/admin/products/:id/deactivate",
      requireAuth,
      postPutRateLimit,
      (req: Request, res: Response) => proxyRequest(req, res, "product")
    );
    app.get(
      "/api/admin/products/:id/images",
      requireAuth,
      (req: Request, res: Response) => proxyRequest(req, res, "product")
    );
    app.delete(
      "/api/admin/products/:id/images/:imageId",
      requireAuth,
      deleteRateLimit,
      (req: Request, res: Response) => proxyRequest(req, res, "product")
    );

    // Route spécifique pour créer un produit
    // Le backoffice utilise maintenant JSON avec DTOs (plus de FormData)
    // Doit être avant la route générique /api/admin/*
    app.post(
      "/api/admin/products",
      requireAuth,
      postPutRateLimit,
      // Plus besoin de multer, on utilise JSON uniquement
      async (req: Request, res: Response) => {
        // Proxy normal vers le service (JSON uniquement)
        await proxyRequest(req, res, "product");
      }
    );

    // Routes admin génériques (doivent être après les routes spécifiques)
    // Applique le rate limiting selon le type de requête
    app.all(
      "/api/admin/*",
      requireAuth,
      async (req: Request, res: Response, next: NextFunction) => {
        // Appliquer le rate limiting selon la méthode HTTP
        if (req.method === "GET") {
          // GET admin : pas de rate limiting spécial, juste auth
          return next();
        } else if (
          req.method === "POST" ||
          req.method === "PUT" ||
          req.method === "PATCH"
        ) {
          // POST/PUT/PATCH : rate limiting pour création/modification
          return postPutRateLimit(req, res, next);
        } else if (req.method === "DELETE") {
          // DELETE : rate limiting strict pour suppression
          return deleteRateLimit(req, res, next);
        } else {
          return next();
        }
      },
      async (req: Request, res: Response) => {
        const service = this.getServiceFromPath(req.path);
        if (service) {
          await proxyRequest(req, res, service);
        } else {
          res
            .status(404)
            .json({ error: "Service non trouvé pour cette route" });
        }
      }
    );

    // Route spécifique pour /api/orders/statistics (AVANT la route générique /api/orders)
    // Transforme /api/orders/statistics en /api/admin/statistics/dashboard du order-service
    app.get(
      "/api/orders/statistics",
      requireAuth,
      async (req: Request, res: Response) => {
        try {
          const headers: Record<string, string> = {};
          if ((req as any).user) {
            const user = (req as any).user;
            headers["x-user-id"] = String(user.userId);
            headers["x-user-email"] = user.email;
          }

          const queryString = req.url.includes("?")
            ? req.url.substring(req.url.indexOf("?"))
            : "";
          const targetUrl = `${SERVICES.order}/api/admin/statistics/dashboard${queryString}`;

          const response = await axios({
            method: "GET",
            url: targetUrl,
            headers: {
              ...headers,
              "Content-Type": "application/json",
            },
            timeout: 60000,
          });

          res.status(response.status).json(response.data);
        } catch (error: any) {
          if (axios.isAxiosError(error) && error.response) {
            res.status(error.response.status).json(error.response.data);
          } else {
            res.status(500).json({
              error: "Service Error",
              message: "Erreur de communication avec le service",
            });
          }
        }
      }
    );

    // Routes publiques - Proxy automatique avec rate limiting par type
    // Appliquer le middleware cart-session pour les routes /api/cart
    app.all(
      "/api/cart*",
      cartSessionMiddleware,
      async (req: Request, res: Response, next: NextFunction) => {
        // Appliquer le rate limiting selon la méthode HTTP
        if (req.method === "GET") {
          return getProductsRateLimit(req, res, next);
        } else if (
          req.method === "POST" ||
          req.method === "PUT" ||
          req.method === "PATCH"
        ) {
          // Pour les routes publiques POST/PUT, on utilise getStaticRateLimit comme fallback
          return getStaticRateLimit(req, res, next);
        } else {
          return next();
        }
      },
      async (req: Request, res: Response) => {
        const service = this.getServiceFromPath(req.path);
        if (service) {
          await proxyRequest(req, res, service);
        } else {
          res
            .status(404)
            .json({ error: "Service non trouvé pour cette route" });
        }
      }
    );

    // Routes GET pour produits et catalogue - Rate limiting élevé
    app.get(
      "/api/products*",
      getProductsRateLimit,
      async (req: Request, res: Response) => {
        const service = this.getServiceFromPath(req.path);
        if (service) {
          await proxyRequest(req, res, service);
        } else {
          res
            .status(404)
            .json({ error: "Service non trouvé pour cette route" });
        }
      }
    );

    // Route spécifique pour les images de produits - Rate limiting pour ressources statiques
    // DOIT être définie AVANT la route générique /api/* pour être prioritaire
    app.get(
      "/api/images/:imageId",
      getStaticRateLimit,
      async (req: Request, res: Response) => {
        const { imageId } = req.params;
        console.log(`[API Gateway] Requête image: /api/images/${imageId}`);

        const service = this.getServiceFromPath(req.path);
        if (service) {
          console.log(`[API Gateway] Proxification vers service: ${service}`);
          await proxyRequest(req, res, service);
        } else {
          console.error(
            `[API Gateway] Service non trouvé pour /api/images/${imageId}`
          );
          res
            .status(404)
            .json({ error: "Service non trouvé pour cette route" });
        }
      }
    );

    app.get(
      "/api/categories*",
      getProductsRateLimit,
      async (req: Request, res: Response) => {
        const service = this.getServiceFromPath(req.path);
        if (service) {
          await proxyRequest(req, res, service);
        } else {
          res
            .status(404)
            .json({ error: "Service non trouvé pour cette route" });
        }
      }
    );

    // Autres routes publiques avec rate limiting selon le type
    app.all(
      "/api/*",
      async (req: Request, res: Response, next: NextFunction) => {
        // Log pour voir si cette route générique intercepte des routes spécifiques
        if (req.path === "/api/payment/finalize") {
          console.log(
            `[API Gateway] ⚠️ Route générique intercepte /api/payment/finalize - cela ne devrait pas arriver!`
          );
        }
        // Appliquer le rate limiting selon la méthode HTTP et le chemin
        if (req.method === "GET") {
          // GET : rate limiting pour pages statiques ou produits selon le chemin
          if (
            req.path.startsWith("/api/products") ||
            req.path.startsWith("/api/categories")
          ) {
            return getProductsRateLimit(req, res, next);
          } else {
            return getStaticRateLimit(req, res, next);
          }
        } else if (
          req.method === "POST" ||
          req.method === "PUT" ||
          req.method === "PATCH"
        ) {
          // POST/PUT/PATCH publiques : nécessitent généralement auth, mais on applique une limite par IP
          return getStaticRateLimit(req, res, next);
        } else {
          return next();
        }
      },
      async (req: Request, res: Response) => {
        // Log pour voir si cette route générique est appelée pour /api/payment/finalize
        if (req.path === "/api/payment/finalize") {
          console.log(
            `[API Gateway] ⚠️ Route générique proxy appelée pour /api/payment/finalize - cela ne devrait pas arriver!`
          );
        }
        const service = this.getServiceFromPath(req.path);
        if (service) {
          await proxyRequest(req, res, service);
        } else {
          res
            .status(404)
            .json({ error: "Service non trouvé pour cette route" });
        }
      }
    );

    // ===== GESTION DES ERREURS =====
    app.use(notFoundHandler);
    app.use(errorHandler);
  }
}
