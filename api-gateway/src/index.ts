/**
 * API GATEWAY - VERSION ULTRA-SIMPLE SANS ERREURS TYPESCRIPT
 */

import express, { Request, Response } from "express";
import axios from "axios";
import cors from "cors";
import helmet from "helmet";
import jwt from "jsonwebtoken";

const app = express();
const PORT = parseInt(process.env["PORT"] || "3020", 10);

// ===== CONFIGURATION JWT =====
const JWT_SECRET = process.env["JWT_SECRET"] || "your-jwt-secret-key";

// ===== CONFIGURATION DES SERVICES =====
const SERVICES = {
  auth: "http://auth-service:3008",
  product: "http://product-service:3002",
  order: "http://order-service:3003",
  cart: "http://cart-service:3004",
  customer: "http://customer-service:3001",
  payment: "http://payment-service:3007",
  email: "http://email-service:3006",
  websiteContent: "http://website-content-service:3005",
} as const;

// ===== MAPPING ROUTES =====
const ROUTES: Record<string, keyof typeof SERVICES> = {
  // === AUTH SERVICE ===
  // Routes publiques (sans authentification)
  "/auth/register": "auth",
  "/auth/login": "auth",

  // Routes admin (avec authentification)
  "/admin/auth/profile": "auth",
  "/admin/auth/change-password": "auth",
  "/admin/auth/logout": "auth",

  // === PRODUCT SERVICE ===
  // Routes publiques
  "/products": "product",
  "/categories": "product",
  "/products/search": "product",

  // Routes admin
  "/admin/products": "product",
  "/admin/categories": "product",

  // === ORDER SERVICE ===
  // Routes publiques
  "/orders": "order",

  // Routes admin
  "/admin/orders": "order",

  // === CART SERVICE (PUBLIQUES) ===
  "/cart": "cart",
  "/cart/add": "cart",
  "/cart/remove": "cart",
  "/cart/clear": "cart",

  // === CUSTOMER SERVICE ===
  // Routes publiques
  "/customers": "customer",

  // Routes admin
  "/admin/customers": "customer",

  // === PAYMENT SERVICE (PUBLIQUES) ===
  "/payments": "payment",
  "/payments/process": "payment",

  // === EMAIL SERVICE (PUBLIQUES) ===
  "/email/send": "email",

  // === WEBSITE CONTENT SERVICE ===
  // Routes publiques
  "/content": "websiteContent",

  // Routes admin
  "/admin/content": "websiteContent",
} as const;

// ===== MIDDLEWARES GLOBAUX =====
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ===== FONCTIONS D'AUTHENTIFICATION =====
const isProtectedRoute = (path: string): boolean => {
  return path.includes("/admin/");
};

const verifyToken = (token: string): any | null => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// ===== ROUTE DE SANTÉ =====
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    status: "OK",
    service: "API Gateway",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

// ===== ROUTE RACINE =====
app.get("/", (_req: Request, res: Response) => {
  res.json({
    message: "API Gateway - E-commerce Platform",
    version: "1.0.0",
    health: "/api/health",
  });
});

// ===== ROUTING AUTOMATIQUE =====
Object.entries(ROUTES).forEach(([route, service]) => {
  const fullRoute = `/api${route}`;
  console.log(`📝 Route enregistrée: ${fullRoute} -> ${service}`);
  app.use(fullRoute, async (req: Request, res: Response) => {
    console.log(`🚀 Route appelée: ${req.path} -> Service: ${service}`);

    try {
      // Utiliser le chemin de la route mappée au lieu de req.path
      const pathWithoutApi = route;
      console.log(
        `🔍 Vérification route: ${pathWithoutApi}, Protégée: ${isProtectedRoute(
          pathWithoutApi
        )}`
      );

      // Vérification de l'authentification pour les routes admin
      if (isProtectedRoute(pathWithoutApi)) {
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1];

        if (!token) {
          console.log("❌ Token manquant pour route admin");
          res.status(401).json({
            error: "Token d'accès requis",
            message:
              "Vous devez fournir un token d'authentification pour accéder aux routes admin",
            code: "MISSING_TOKEN",
          });
          return;
        }

        const user = verifyToken(token);
        if (!user) {
          console.log("❌ Token invalide pour route admin");
          res.status(401).json({
            error: "Token invalide",
            message: "Le token d'authentification est invalide ou expiré",
            code: "INVALID_TOKEN",
          });
          return;
        }

        console.log(`🔐 Admin authentifié: ${user.email} (${user.userId})`);
        (req as any).user = user;
      }

      // Préparation de la requête vers le service
      const serviceUrl = SERVICES[service];
      const targetUrl = `${serviceUrl}${req.path}`;

      console.log(`📤 Envoi vers: ${targetUrl}`);

      // Headers à transmettre
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      // Ajouter l'utilisateur authentifié dans les headers si disponible
      if ((req as any).user) {
        headers["X-User-ID"] = String((req as any).user.userId);
        headers["X-User-Email"] = (req as any).user.email;
      }

      // Supprimer le header host pour éviter les conflits
      delete headers["host"];

      // Faire la requête vers le service
      const response = await axios({
        method: req.method,
        url: targetUrl,
        headers,
        data: req.body,
        params: req.query,
        timeout: 30000,
      });

      console.log(
        `✅ ${req.method} ${req.path} → ${service} (${response.status})`
      );
      res.status(response.status).json(response.data);
    } catch (error: any) {
      console.log(`❌ ${req.method} ${req.path} → ${service} (500)`);

      if (axios.isAxiosError(error)) {
        const axiosError = error as any;
        if (axiosError.response) {
          res.status(axiosError.response.status).json(axiosError.response.data);
        } else {
          res.status(500).json({
            error: "Service Error",
            message: "Erreur de communication avec le service",
            service: service,
          });
        }
      } else {
        res.status(500).json({
          error: "Internal Server Error",
          message: "Erreur interne du serveur",
        });
      }
    }
  });
});

// ===== GESTION DES ERREURS =====
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: "Not Found",
    message: "Route non trouvée",
    path: req.path,
  });
});

// ===== DÉMARRAGE DU SERVEUR =====
app.listen(PORT, () => {
  console.log("╔════════════════════════════════════════╗");
  console.log("║   🚀 API GATEWAY - ULTRA SIMPLE v1.0   ║");
  console.log("╚════════════════════════════════════════╝");
  console.log("");
  console.log(`📍 Port: ${PORT}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log(`📊 Health: http://localhost:${PORT}/api/health`);
  console.log("");
});
