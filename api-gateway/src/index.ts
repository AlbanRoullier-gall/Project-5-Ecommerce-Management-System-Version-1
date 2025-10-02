/**
 * API GATEWAY - VERSION ULTRA-SIMPLE
 * 1 seul fichier, routing automatique vers les microservices
 */

import express, { Request, Response, NextFunction } from "express";
import axios, { AxiosError } from "axios";
import cors from "cors";
import helmet from "helmet";

const app = express();
const PORT = parseInt(process.env["PORT"] || "3000", 10);

// ===== TYPES =====
type ServiceName = keyof typeof SERVICES;

// ===== CONFIGURATION DES SERVICES =====
const SERVICES = {
  auth: "http://localhost:3008",
  product: "http://localhost:3002",
  order: "http://localhost:3003",
  cart: "http://localhost:3004",
  customer: "http://localhost:3001",
  payment: "http://localhost:3007",
  email: "http://localhost:3006",
  websiteContent: "http://localhost:3005",
} as const;

// ===== MAPPING ROUTES =====
const ROUTES: Record<string, ServiceName> = {
  // === AUTH SERVICE ===
  "/auth/register": "auth",
  "/auth/login": "auth",
  "/auth/profile": "auth",
  "/auth/change-password": "auth",
  "/auth/logout": "auth",

  // === PRODUCT SERVICE ===
  // Public routes
  "/products": "product",
  "/products/:id": "product",
  "/categories": "product",

  // Admin routes
  "/admin/products": "product",
  "/admin/products/:id": "product",
  "/admin/products/:id/toggle": "product",
  "/admin/products/:id/activate": "product",
  "/admin/products/:id/deactivate": "product",
  "/admin/products/with-images": "product",
  "/admin/products/:id/images": "product",
  "/admin/products/:id/images/:imageId": "product",
  "/admin/categories": "product",
  "/admin/categories/:id": "product",
  "/admin/images/:imageId": "product",

  // === ORDER SERVICE ===
  "/orders": "order",
  "/orders/:id": "order",
  "/order-items": "order",
  "/order-items/:id": "order",
  "/orders/:orderId/items": "order",
  "/credit-notes": "order",
  "/credit-notes/:id": "order",
  "/credit-note-items": "order",
  "/order-addresses": "order",
  "/statistics/orders": "order",
  "/customers/:customerId/credit-notes": "order",
  "/customers/:customerId/statistics/orders": "order",

  // === CART SERVICE ===
  "/cart": "cart",
  "/cart/items": "cart",
  "/cart/items/:productId": "cart",
  "/cart/validate": "cart",
  "/cart/stats": "cart",

  // === CUSTOMER SERVICE ===
  "/customers": "customer",
  "/customers/:id": "customer",
  "/customers/:customerId/addresses": "customer",
  "/customers/:customerId/companies": "customer",
  "/civilities": "customer",
  "/countries": "customer",
  "/socio-professional-categories": "customer",
  "/customer-addresses": "customer",
  "/customer-companies": "customer",

  // === PAYMENT SERVICE ===
  "/payment/create": "payment",
  "/payment/confirm": "payment",
  "/payment/refund": "payment",
  "/payment/:paymentId": "payment",
  "/payment/stats": "payment",

  // === EMAIL SERVICE ===
  "/email/send": "email",
  "/email/confirmation": "email",
  "/contact": "email",

  // === WEBSITE CONTENT SERVICE ===
  "/website-content/pages": "websiteContent",
  "/website-content/pages/:slug": "websiteContent",
  "/website-content/slugs": "websiteContent",
  "/admin/website-content/pages": "websiteContent",
  "/admin/website-content/pages/:slug": "websiteContent",
  "/admin/website-content/pages/:slug/versions": "websiteContent",
  "/admin/website-content/pages/:slug/rollback": "websiteContent",
  "/admin/website-content/pages/:slug/versions/:versionNumber":
    "websiteContent",
};

// ===== MIDDLEWARES =====
app.use(helmet());
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3009",
      "http://localhost:3010",
    ],
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ===== ROUTES DE SANTÉ =====
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    status: "OK",
    service: "api-gateway",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/health/services", async (_req: Request, res: Response) => {
  const results: Record<string, boolean> = {};
  await Promise.all(
    Object.entries(SERVICES).map(async ([name, url]) => {
      try {
        const response = await axios.get(`${url}/api/health`, {
          timeout: 5000,
        });
        results[name] = response.status === 200;
      } catch {
        results[name] = false;
      }
    })
  );

  const allHealthy = Object.values(results).every((h) => h);
  res
    .status(allHealthy ? 200 : 503)
    .json({ status: allHealthy ? "OK" : "DEGRADED", services: results });
});

// ===== ROUTING AUTOMATIQUE =====
Object.entries(ROUTES).forEach(([route, service]) => {
  app.use(`/api${route}`, async (req: Request, res: Response) => {
    try {
      const serviceUrl = SERVICES[service];
      const targetUrl = `${serviceUrl}${req.originalUrl}`;

      const response = await axios({
        method: req.method,
        url: targetUrl,
        data: req.body,
        params: req.query,
        headers: { ...req.headers, host: undefined },
        timeout: 30000,
      });

      console.log(
        `✅ ${req.method} ${req.originalUrl} → ${service} (${response.status})`
      );
      res.status(response.status).json(response.data);
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      const status = axiosError.response?.status || 500;
      const message = axiosError.response?.data || { error: "Service Error" };

      console.error(
        `❌ ${req.method} ${req.originalUrl} → ${service} (${status})`
      );
      res.status(status).json(message);
    }
  });
});

// ===== ROUTE RACINE =====
app.get("/", (_req: Request, res: Response) => {
  res.json({
    name: "API Gateway - Ultra Simple",
    version: "1.0.0",
    status: "Running",
    health: "/api/health",
  });
});

// ===== 404 HANDLER =====
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: "Route Not Found",
    message: `${req.method} ${req.originalUrl} does not exist`,
  });
});

// ===== ERROR HANDLER =====
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    error: "Internal Server Error",
    message:
      process.env["NODE_ENV"] === "production"
        ? "An error occurred"
        : err.message,
  });
});

// ===== DÉMARRAGE =====
app.listen(PORT, () => {
  console.log("\n╔════════════════════════════════════════╗");
  console.log("║   🚀 API GATEWAY - ULTRA SIMPLE v1.0   ║");
  console.log("╚════════════════════════════════════════╝\n");
  console.log(`📍 Port: ${PORT}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log(`📊 Health: http://localhost:${PORT}/api/health\n`);
});

export default app;
