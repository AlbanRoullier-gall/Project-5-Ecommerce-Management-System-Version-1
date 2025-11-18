/**
 * API Router
 * Configuration des routes et middlewares
 *
 * Architecture : Router pattern (comme les services)
 * - Configuration centralisée des routes
 * - Utilisation des controllers
 * - Application des middlewares
 */

import { Application, Request, Response } from "express";
import express from "express";
import multer from "multer";
import {
  requireAuth,
  corsMiddleware,
  helmetMiddleware,
  jsonParser,
  urlencodedParser,
  notFoundHandler,
  errorHandler,
} from "./middleware";
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
} from "./controller";

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
  private upload: multer.Multer;

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

    // Configuration Multer pour les uploads
    this.upload = multer({
      storage: multer.memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    });
  }

  /**
   * Configuration des middlewares globaux
   */
  private setupMiddlewares(app: express.Application): void {
    // ===== SÉCURITÉ =====
    app.use(corsMiddleware);
    app.use(helmetMiddleware);

    // ===== PARSING DU BODY =====
    // Parsers conditionnels basés sur Content-Type
    app.use(jsonParser);
    app.use(urlencodedParser);
  }

  /**
   * Configuration de toutes les routes
   */
  setupRoutes(app: Application): void {
    this.setupMiddlewares(app);
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
    app.post("/api/auth/login", this.authController.login);
    app.post(
      "/api/auth/validate-password",
      this.authController.validatePassword
    );

    // Routes orchestrées
    app.post("/api/auth/register", this.authController.register);
    app.post("/api/auth/reset-password", this.authController.resetPassword);
    app.post(
      "/api/auth/reset-password/confirm",
      this.authController.resetPasswordConfirm
    );
    app.get(
      "/api/auth/approve-backoffice",
      this.authController.approveBackoffice
    );
    app.get(
      "/api/auth/reject-backoffice",
      this.authController.rejectBackoffice
    );

    // Routes admin
    app.put(
      "/api/admin/auth/change-password",
      requireAuth,
      this.authController.changePassword
    );
    app.post("/api/admin/auth/logout", requireAuth, this.authController.logout);

    // ===== ROUTES PRODUITS =====

    // Routes publiques
    app.all("/api/products", this.productController.listProducts);
    app.all("/api/products/:id", this.productController.getProduct);
    app.all("/api/categories", this.productController.listCategories);
    app.all("/api/images/:imageId", this.productController.getImage);

    // Routes admin
    // IMPORTANT: Les routes spécifiques doivent être enregistrées AVANT les routes paramétrées
    // Sinon Express match la route générique (:id) avant la route spécifique (with-images)
    app.all(
      "/api/admin/products",
      requireAuth,
      this.productController.adminListProducts
    );
    // Route spécifique avec-images (doit être AVANT /admin/products/:id)
    app.post(
      "/api/admin/products/with-images",
      requireAuth,
      this.upload.array("images", 10),
      this.productController.createProductWithImages
    );
    // Routes avec paramètres mais plus spécifiques que :id seul
    app.post(
      "/api/admin/products/:id/activate",
      requireAuth,
      this.productController.activateProduct
    );
    app.post(
      "/api/admin/products/:id/deactivate",
      requireAuth,
      this.productController.deactivateProduct
    );
    app.post(
      "/api/admin/products/:id/images",
      requireAuth,
      this.upload.array("images", 5),
      this.productController.uploadProductImages
    );
    app.get(
      "/api/admin/products/:id/images",
      requireAuth,
      this.productController.listProductImages
    );
    app.delete(
      "/api/admin/products/:id/images/:imageId",
      requireAuth,
      this.productController.deleteProductImage
    );
    // Route générique :id (doit être EN DERNIER pour ne pas intercepter les routes spécifiques)
    app.all(
      "/api/admin/products/:id",
      requireAuth,
      this.productController.adminGetProduct
    );
    app.all(
      "/api/admin/categories",
      requireAuth,
      this.productController.adminListCategories
    );
    app.all(
      "/api/admin/categories/:id",
      requireAuth,
      this.productController.adminGetCategory
    );

    // Route statique pour les images (sans préfixe /api)
    app.get("/uploads/*", this.productController.serveStaticImage);

    // ===== ROUTES COMMANDES =====

    // Routes publiques
    app.all("/api/orders", this.orderController.listOrders);
    app.all("/api/orders/:id", this.orderController.getOrder);
    app.all("/api/orders/:orderId/items", this.orderController.getOrderItems);
    app.all(
      "/api/orders/:orderId/addresses",
      this.orderController.getOrderAddresses
    );
    app.get(
      "/api/customers/:customerId/credit-notes",
      this.orderController.getCustomerCreditNotes
    );
    app.get("/api/statistics/orders", this.orderController.getOrderStatistics);

    // Routes admin
    app.all(
      "/api/admin/orders",
      requireAuth,
      this.orderController.adminListOrders
    );
    app.all(
      "/api/admin/orders/:id",
      requireAuth,
      this.orderController.adminGetOrder
    );
    app.all(
      "/api/admin/order-items",
      requireAuth,
      this.orderController.adminListOrderItems
    );
    app.all(
      "/api/admin/order-items/:id",
      requireAuth,
      this.orderController.adminGetOrderItem
    );
    app.all(
      "/api/admin/credit-notes",
      requireAuth,
      this.orderController.adminListCreditNotes
    );
    app.all(
      "/api/admin/credit-notes/:id",
      requireAuth,
      this.orderController.adminGetCreditNote
    );
    app.all(
      "/api/admin/credit-note-items",
      requireAuth,
      this.orderController.adminListCreditNoteItems
    );
    app.all(
      "/api/admin/credit-note-items/:id",
      requireAuth,
      this.orderController.adminGetCreditNoteItem
    );
    app.all(
      "/api/admin/order-addresses",
      requireAuth,
      this.orderController.adminListOrderAddresses
    );
    app.all(
      "/api/admin/order-addresses/:id",
      requireAuth,
      this.orderController.adminGetOrderAddress
    );
    app.patch(
      "/api/admin/orders/:id/delivery-status",
      requireAuth,
      this.orderController.updateDeliveryStatus
    );
    app.get(
      "/api/admin/orders/:orderId/items",
      requireAuth,
      this.orderController.getOrderItems
    );
    app.get(
      "/api/admin/orders/:orderId/addresses",
      requireAuth,
      this.orderController.getOrderAddresses
    );
    app.patch(
      "/api/admin/credit-notes/:id/status",
      requireAuth,
      this.orderController.updateCreditNoteStatus
    );
    app.get(
      "/api/admin/credit-notes/:creditNoteId/items",
      requireAuth,
      this.orderController.getCreditNoteItems
    );
    app.get(
      "/api/admin/statistics/orders",
      requireAuth,
      this.orderController.adminGetOrderStatistics
    );
    app.get(
      "/api/admin/orders/year/:year/export-data",
      requireAuth,
      this.orderController.exportOrdersYear
    );

    // ===== ROUTES PANIER =====

    // Routes publiques
    app.all("/api/cart", this.cartController.getCart);
    app.post("/api/cart/items", this.cartController.addItem);
    app.all("/api/cart/items/:productId", this.cartController.updateItem);
    // Note: Les routes de snapshot checkout sont gérées directement par cart-service
    // et accessibles via le proxy automatique

    // ===== ROUTES CLIENTS =====

    // Routes publiques
    app.post("/api/customers", this.customerController.createCustomer);
    app.get(
      "/api/customers/by-email/:email",
      this.customerController.getCustomerByEmail
    );
    app.get("/api/customers/countries", this.customerController.getCountries);
    app.get("/api/customers/:id", this.customerController.getCustomer);
    app.post(
      "/api/customers/:customerId/addresses",
      this.customerController.createAddress
    );

    // Routes admin
    app.all(
      "/api/admin/customers",
      requireAuth,
      this.customerController.adminListCustomers
    );
    app.all(
      "/api/admin/customers/:id",
      requireAuth,
      this.customerController.adminGetCustomer
    );
    app.all(
      "/api/admin/customers/:customerId/addresses",
      requireAuth,
      this.customerController.adminListAddresses
    );
    app.get(
      "/api/admin/customers/search",
      requireAuth,
      this.customerController.adminSearchCustomers
    );
    app.get(
      "/api/admin/customers/countries",
      requireAuth,
      this.customerController.adminGetCountries
    );
    app.all(
      "/api/admin/customers/:customerId/addresses/:id",
      requireAuth,
      this.customerController.adminGetAddress
    );

    // ===== ROUTES PAIEMENT =====

    // Routes orchestrées
    app.post("/api/payment/create", this.paymentController.createPayment);
    app.post("/api/payment/finalize", this.paymentController.finalizePayment);

    // ===== ROUTES EMAIL =====

    // Routes publiques (toutes en POST)
    app.post("/api/email/send", this.emailController.sendEmail);
    app.post(
      "/api/email/send-reset-email",
      this.emailController.sendResetEmail
    );
    app.post("/api/email/confirmation", this.emailController.sendConfirmation);
    app.post(
      "/api/email/backoffice-approval-request",
      this.emailController.sendBackofficeApprovalRequest
    );
    app.post(
      "/api/email/backoffice-approval-confirmation",
      this.emailController.sendBackofficeApprovalConfirmation
    );
    app.post(
      "/api/email/backoffice-rejection-notification",
      this.emailController.sendBackofficeRejectionNotification
    );
    app.post(
      "/api/email/order-confirmation",
      this.emailController.sendOrderConfirmation
    );

    // ===== ROUTES EXPORT =====

    // Routes admin
    app.post(
      "/api/admin/export/orders-year",
      requireAuth,
      this.exportController.exportOrdersYearPost
    );
    app.get(
      "/api/admin/exports/orders-year/:year",
      requireAuth,
      this.exportController.exportOrdersYear
    );

    // ===== GESTION DES ERREURS =====
    // Doit être placé en dernier, après toutes les routes
    // 1. D'abord le handler 404 (routes non trouvées)
    app.use(notFoundHandler);
    // 2. Ensuite le handler d'erreurs générales (erreurs 500, etc.)
    app.use(errorHandler);
  }
}
