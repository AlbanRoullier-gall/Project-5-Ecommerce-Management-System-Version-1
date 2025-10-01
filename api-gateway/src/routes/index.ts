/**
 * Router principal - Agrégation de toutes les routes
 * Point d'entrée central pour toutes les routes de l'API Gateway
 */

import { Router, Request, Response } from "express";
import { serviceClient } from "../clients/ServiceClient";

// Import des routers de chaque service
import authRoutes from "./auth.routes";
import productsRoutes from "./products.routes";
import emailRoutes from "./email.routes";
import ordersRoutes from "./orders.routes";
import cartRoutes from "./cart.routes";
import customersRoutes from "./customers.routes";
import paymentsRoutes from "./payments.routes";
import contentRoutes from "./content.routes";

const router = Router();

// ===== ROUTES DE SANTÉ =====

/**
 * Health check de l'API Gateway
 */
router.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "OK",
    service: "api-gateway",
    timestamp: new Date().toISOString(),
    version: "2.0.0",
  });
});

/**
 * Health check détaillé de tous les services
 */
router.get("/health/services", async (_req: Request, res: Response) => {
  try {
    const servicesHealth = await serviceClient.healthCheckAll();

    const allHealthy = Object.values(servicesHealth).every(
      (isHealthy) => isHealthy
    );

    res.status(allHealthy ? 200 : 503).json({
      status: allHealthy ? "OK" : "DEGRADED",
      timestamp: new Date().toISOString(),
      services: servicesHealth,
    });
  } catch (error) {
    res.status(500).json({
      status: "ERROR",
      timestamp: new Date().toISOString(),
      error: "Failed to check services health",
    });
  }
});

/**
 * Informations sur l'API Gateway
 */
router.get("/info", (_req: Request, res: Response) => {
  res.json({
    name: "API Gateway - E-commerce Platform",
    version: "2.0.0",
    description: "Centralized gateway for all microservices",
    architecture: "Microservices with API Gateway pattern",
    features: [
      "Service proxy with timeout management",
      "Centralized error handling",
      "Structured logging with Winston",
      "Health checks for all services",
      "Standardized error responses",
    ],
    status: "Ready",
    connectedServices: [
      "auth-service",
      "product-service",
      "order-service",
      "cart-service",
      "customer-service",
      "payment-service",
      "email-service",
      "website-content-service",
    ],
  });
});

// ===== MONTAGE DES ROUTES PAR SERVICE =====

// Routes d'authentification
router.use("/auth", authRoutes);

// Routes de produits et catégories
router.use("/products", productsRoutes);

// Routes d'administration des produits
router.use("/admin/products", productsRoutes);
router.use("/admin/categories", productsRoutes);

// Routes d'emails
router.use("/contact", emailRoutes);
router.use("/email", emailRoutes);

// Routes de commandes
router.use("/orders", ordersRoutes);

// Routes de panier
router.use("/cart", cartRoutes);

// Routes de clients
router.use("/customers", customersRoutes);

// Routes de paiements
router.use("/payments", paymentsRoutes);

// Routes de contenu web
router.use("/content", contentRoutes);

export default router;
