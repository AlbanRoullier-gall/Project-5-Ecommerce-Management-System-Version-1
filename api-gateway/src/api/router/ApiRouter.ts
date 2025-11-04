/**
 * API Router
 * Configuration des routes et middlewares
 *
 * Architecture : Router pattern
 * - Configuration centralisée des routes
 * - Utilisation des controllers
 * - Application des middlewares
 */

import { Application, Request, Response } from "express";
import { requireAuth } from "../../auth";
import { createUploadMiddleware } from "../../core/uploads";
import { needsAuth, getUploadConfig } from "../../core/conventions";
import {
  HealthController,
  AuthController,
  ProductController,
  OrderController,
  CartController,
  CustomerController,
  PaymentController,
  EmailController,
  ExportController,
} from "../controller";

export class ApiRouter {
  private healthController: HealthController;
  private authController: AuthController;
  private productController: ProductController;
  private orderController: OrderController;
  private cartController: CartController;
  private customerController: CustomerController;
  private paymentController: PaymentController;
  private emailController: EmailController;
  private exportController: ExportController;

  constructor() {
    this.healthController = new HealthController();
    this.authController = new AuthController();
    this.productController = new ProductController();
    this.orderController = new OrderController();
    this.cartController = new CartController();
    this.customerController = new CustomerController();
    this.paymentController = new PaymentController();
    this.emailController = new EmailController();
    this.exportController = new ExportController();
  }

  /**
   * Enregistre une route avec conventions automatiques
   */
  private registerRoute(
    app: Application,
    method: "get" | "post" | "put" | "delete" | "patch" | "all",
    path: string,
    handler: (req: Request, res: Response) => Promise<void> | void,
    options?: {
      auth?: boolean;
      upload?: {
        type: "single" | "multiple";
        field: string;
        maxFiles?: number;
      };
    }
  ): void {
    const fullPath = `/api${path}`;
    const middlewares: any[] = [];

    console.log(`🔧 Registering route: ${method.toUpperCase()} ${fullPath}`);

    // Authentification (convention ou explicite)
    const needsAuthentication = options?.auth ?? needsAuth(path);
    if (needsAuthentication) {
      console.log(`   → Adding auth middleware`);
      middlewares.push(requireAuth);
    }

    // Upload (convention ou explicite)
    if (options?.upload) {
      console.log(
        `📎 Upload config (explicit): ${options.upload.type} field "${options.upload.field}"`
      );
      middlewares.push(
        createUploadMiddleware(
          options.upload.type,
          options.upload.field,
          options.upload.maxFiles
        )
      );
    } else {
      const uploadConfig = getUploadConfig(path, method.toUpperCase());
      if (uploadConfig) {
        console.log(
          `📎 Upload config (auto-detected): ${uploadConfig.type} field "${
            uploadConfig.field
          }" for ${method.toUpperCase()} ${path}`
        );
        const uploadMiddleware = createUploadMiddleware(
          uploadConfig.type,
          uploadConfig.field,
          uploadConfig.maxFiles
        );
        middlewares.push(uploadMiddleware);
        console.log(
          `   ✅ Multer middleware added to chain (total middlewares: ${middlewares.length})`
        );
      } else {
        console.log(
          `📎 No upload config detected for ${method.toUpperCase()} ${path}`
        );
      }
    }

    // Handler
    middlewares.push(handler);
    console.log(
      `   📋 Final middleware chain: ${
        middlewares.length
      } middleware(s) for ${method.toUpperCase()} ${fullPath}`
    );

    // Enregistrer la route
    if (method === "all") {
      app.all(fullPath, ...middlewares);
    } else {
      (app as any)[method](fullPath, ...middlewares);
    }

    const routeType = path.includes("/admin/") ? "admin" : "public";
    console.log(`📝 Route ${routeType}: ${method.toUpperCase()} ${fullPath}`);
  }

  /**
   * Configuration de toutes les routes
   */
  setupRoutes(app: Application): void {
    // ===== ROUTES DE BASE =====
    app.get("/api/health", (req: Request, res: Response) => {
      this.healthController.healthCheck(req, res);
    });

    app.get("/", (_req: Request, res: Response) => {
      res.json({
        message: "API Gateway - E-commerce Platform",
        version: "3.0.0",
        health: "/api/health",
      });
    });

    // ===== ROUTES D'AUTHENTIFICATION =====

    // Routes publiques proxy
    this.registerRoute(app, "post", "/auth/login", this.authController.login);
    this.registerRoute(
      app,
      "post",
      "/auth/validate-password",
      this.authController.validatePassword
    );

    // Routes orchestrées
    this.registerRoute(
      app,
      "post",
      "/auth/register",
      this.authController.register
    );
    this.registerRoute(
      app,
      "post",
      "/auth/reset-password",
      this.authController.resetPassword
    );
    this.registerRoute(
      app,
      "post",
      "/auth/reset-password/confirm",
      this.authController.resetPasswordConfirm
    );
    this.registerRoute(
      app,
      "get",
      "/auth/approve-backoffice",
      this.authController.approveBackoffice
    );
    this.registerRoute(
      app,
      "get",
      "/auth/reject-backoffice",
      this.authController.rejectBackoffice
    );

    // Routes admin
    this.registerRoute(
      app,
      "put",
      "/admin/auth/change-password",
      this.authController.changePassword,
      { auth: true }
    );
    this.registerRoute(
      app,
      "post",
      "/admin/auth/logout",
      this.authController.logout,
      { auth: true }
    );

    // ===== ROUTES PRODUITS =====

    // Routes publiques
    this.registerRoute(
      app,
      "all",
      "/products",
      this.productController.listProducts
    );
    this.registerRoute(
      app,
      "all",
      "/products/:id",
      this.productController.getProduct
    );
    this.registerRoute(
      app,
      "all",
      "/categories",
      this.productController.listCategories
    );
    this.registerRoute(
      app,
      "all",
      "/images/:imageId",
      this.productController.getImage
    );

    // Routes admin
    // IMPORTANT: Les routes spécifiques doivent être enregistrées AVANT les routes paramétrées
    // Sinon Express match la route générique (:id) avant la route spécifique (with-images)
    this.registerRoute(
      app,
      "all",
      "/admin/products",
      this.productController.adminListProducts,
      { auth: true }
    );
    // Route spécifique avec-images (doit être AVANT /admin/products/:id)
    this.registerRoute(
      app,
      "post",
      "/admin/products/with-images",
      this.productController.createProductWithImages,
      { auth: true }
    );
    // Routes avec paramètres mais plus spécifiques que :id seul
    this.registerRoute(
      app,
      "post",
      "/admin/products/:id/activate",
      this.productController.activateProduct,
      { auth: true }
    );
    this.registerRoute(
      app,
      "post",
      "/admin/products/:id/deactivate",
      this.productController.deactivateProduct,
      { auth: true }
    );
    this.registerRoute(
      app,
      "post",
      "/admin/products/:id/images",
      this.productController.uploadProductImages,
      { auth: true }
    );
    this.registerRoute(
      app,
      "get",
      "/admin/products/:id/images",
      this.productController.listProductImages,
      { auth: true }
    );
    this.registerRoute(
      app,
      "delete",
      "/admin/products/:id/images/:imageId",
      this.productController.deleteProductImage,
      { auth: true }
    );
    // Route générique :id (doit être EN DERNIER pour ne pas intercepter les routes spécifiques)
    this.registerRoute(
      app,
      "all",
      "/admin/products/:id",
      this.productController.adminGetProduct,
      { auth: true }
    );
    this.registerRoute(
      app,
      "all",
      "/admin/categories",
      this.productController.adminListCategories,
      { auth: true }
    );
    this.registerRoute(
      app,
      "all",
      "/admin/categories/:id",
      this.productController.adminGetCategory,
      { auth: true }
    );

    // Route statique pour les images (sans préfixe /api)
    app.get("/uploads/*", this.productController.serveStaticImage);

    // ===== ROUTES COMMANDES =====

    // Routes publiques
    this.registerRoute(app, "all", "/orders", this.orderController.listOrders);
    this.registerRoute(
      app,
      "all",
      "/orders/:id",
      this.orderController.getOrder
    );
    this.registerRoute(
      app,
      "all",
      "/orders/:orderId/items",
      this.orderController.getOrderItems
    );
    this.registerRoute(
      app,
      "all",
      "/orders/:orderId/addresses",
      this.orderController.getOrderAddresses
    );
    this.registerRoute(
      app,
      "get",
      "/customers/:customerId/credit-notes",
      this.orderController.getCustomerCreditNotes
    );
    this.registerRoute(
      app,
      "get",
      "/statistics/orders",
      this.orderController.getOrderStatistics
    );

    // Routes admin
    this.registerRoute(
      app,
      "all",
      "/admin/orders",
      this.orderController.adminListOrders,
      { auth: true }
    );
    this.registerRoute(
      app,
      "all",
      "/admin/orders/:id",
      this.orderController.adminGetOrder,
      { auth: true }
    );
    this.registerRoute(
      app,
      "all",
      "/admin/order-items",
      this.orderController.adminListOrderItems,
      { auth: true }
    );
    this.registerRoute(
      app,
      "all",
      "/admin/order-items/:id",
      this.orderController.adminGetOrderItem,
      { auth: true }
    );
    this.registerRoute(
      app,
      "all",
      "/admin/credit-notes",
      this.orderController.adminListCreditNotes,
      { auth: true }
    );
    this.registerRoute(
      app,
      "all",
      "/admin/credit-notes/:id",
      this.orderController.adminGetCreditNote,
      { auth: true }
    );
    this.registerRoute(
      app,
      "all",
      "/admin/credit-note-items",
      this.orderController.adminListCreditNoteItems,
      { auth: true }
    );
    this.registerRoute(
      app,
      "all",
      "/admin/credit-note-items/:id",
      this.orderController.adminGetCreditNoteItem,
      { auth: true }
    );
    this.registerRoute(
      app,
      "all",
      "/admin/order-addresses",
      this.orderController.adminListOrderAddresses,
      { auth: true }
    );
    this.registerRoute(
      app,
      "all",
      "/admin/order-addresses/:id",
      this.orderController.adminGetOrderAddress,
      { auth: true }
    );
    this.registerRoute(
      app,
      "patch",
      "/admin/orders/:id/delivery-status",
      this.orderController.updateDeliveryStatus,
      { auth: true }
    );
    this.registerRoute(
      app,
      "get",
      "/admin/orders/:orderId/items",
      this.orderController.getOrderItems,
      { auth: true }
    );
    this.registerRoute(
      app,
      "get",
      "/admin/orders/:orderId/addresses",
      this.orderController.getOrderAddresses,
      { auth: true }
    );
    this.registerRoute(
      app,
      "patch",
      "/admin/credit-notes/:id/status",
      this.orderController.updateCreditNoteStatus,
      { auth: true }
    );
    this.registerRoute(
      app,
      "get",
      "/admin/credit-notes/:creditNoteId/items",
      this.orderController.getCreditNoteItems,
      { auth: true }
    );
    this.registerRoute(
      app,
      "get",
      "/admin/statistics/orders",
      this.orderController.adminGetOrderStatistics,
      { auth: true }
    );
    this.registerRoute(
      app,
      "get",
      "/admin/orders/year/:year/export-data",
      this.orderController.exportOrdersYear,
      { auth: true }
    );

    // ===== ROUTES PANIER =====

    // Routes publiques
    this.registerRoute(app, "all", "/cart", this.cartController.getCart);
    this.registerRoute(app, "post", "/cart/items", this.cartController.addItem);
    this.registerRoute(
      app,
      "all",
      "/cart/items/:productId",
      this.cartController.updateItem
    );

    // Routes de snapshot checkout
    this.registerRoute(
      app,
      "patch",
      "/cart/checkout",
      this.cartController.saveCheckoutSnapshot
    );
    this.registerRoute(
      app,
      "get",
      "/cart/checkout",
      this.cartController.getCheckoutSnapshot
    );

    // ===== ROUTES CLIENTS =====

    // Routes publiques
    this.registerRoute(
      app,
      "post",
      "/customers",
      this.customerController.createCustomer
    );
    this.registerRoute(
      app,
      "get",
      "/customers/by-email/:email",
      this.customerController.getCustomerByEmail
    );
    this.registerRoute(
      app,
      "get",
      "/customers/countries",
      this.customerController.getCountries
    );
    this.registerRoute(
      app,
      "get",
      "/customers/:id",
      this.customerController.getCustomer
    );
    this.registerRoute(
      app,
      "post",
      "/customers/:customerId/addresses",
      this.customerController.createAddress
    );

    // Routes admin
    this.registerRoute(
      app,
      "all",
      "/admin/customers",
      this.customerController.adminListCustomers,
      { auth: true }
    );
    this.registerRoute(
      app,
      "all",
      "/admin/customers/:id",
      this.customerController.adminGetCustomer,
      { auth: true }
    );
    this.registerRoute(
      app,
      "all",
      "/admin/customers/:customerId/addresses",
      this.customerController.adminListAddresses,
      { auth: true }
    );
    this.registerRoute(
      app,
      "get",
      "/admin/customers/search",
      this.customerController.adminSearchCustomers,
      { auth: true }
    );
    this.registerRoute(
      app,
      "get",
      "/admin/customers/countries",
      this.customerController.adminGetCountries,
      { auth: true }
    );
    this.registerRoute(
      app,
      "all",
      "/admin/customers/:customerId/addresses/:id",
      this.customerController.adminGetAddress,
      { auth: true }
    );

    // ===== ROUTES PAIEMENT =====

    // Routes orchestrées
    this.registerRoute(
      app,
      "post",
      "/payment/create",
      this.paymentController.createPayment
    );
    this.registerRoute(
      app,
      "post",
      "/webhooks/stripe",
      this.paymentController.stripeWebhook
    );
    this.registerRoute(
      app,
      "post",
      "/payment/finalize",
      this.paymentController.finalizePayment
    );

    // ===== ROUTES EMAIL =====

    // Routes publiques (toutes en POST)
    this.registerRoute(
      app,
      "post",
      "/email/send",
      this.emailController.sendEmail
    );
    this.registerRoute(
      app,
      "post",
      "/email/send-reset-email",
      this.emailController.sendResetEmail
    );
    this.registerRoute(
      app,
      "post",
      "/email/confirmation",
      this.emailController.sendConfirmation
    );
    this.registerRoute(
      app,
      "post",
      "/email/backoffice-approval-request",
      this.emailController.sendBackofficeApprovalRequest
    );
    this.registerRoute(
      app,
      "post",
      "/email/backoffice-approval-confirmation",
      this.emailController.sendBackofficeApprovalConfirmation
    );
    this.registerRoute(
      app,
      "post",
      "/email/backoffice-rejection-notification",
      this.emailController.sendBackofficeRejectionNotification
    );
    this.registerRoute(
      app,
      "post",
      "/email/order-confirmation",
      this.emailController.sendOrderConfirmation
    );

    // ===== ROUTES EXPORT =====

    // Routes admin
    this.registerRoute(
      app,
      "post",
      "/admin/export/orders-year",
      this.exportController.exportOrdersYearPost,
      { auth: true }
    );
    this.registerRoute(
      app,
      "get",
      "/admin/exports/orders-year/:year",
      this.exportController.exportOrdersYear,
      { auth: true }
    );

    console.log("\n✅ Toutes les routes ont été enregistrées\n");
  }
}
