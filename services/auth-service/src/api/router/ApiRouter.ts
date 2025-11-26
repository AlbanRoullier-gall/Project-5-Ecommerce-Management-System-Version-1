/**
 * ApiRouter
 * Configuration des routes et middlewares
 *
 * Architecture : Router pattern
 * - Configuration centralisée des routes
 * - Middlewares d'authentification
 * - Validation des données
 */
import express, { Request, Response, NextFunction } from "express";
import { Pool } from "pg";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { AuthService } from "../../services/AuthService";
import { AuthController } from "../controller/AuthController";
import { HealthController } from "../controller/HealthController";
import { ValidationMiddleware } from "../middleware/ValidationMiddleware";

export class ApiRouter {
  private authController: AuthController;
  private healthController: HealthController;
  private validationSchemas: any;

  constructor(pool: Pool) {
    const authService = new AuthService(pool);
    this.authController = new AuthController(authService);
    this.healthController = new HealthController();

    this.validationSchemas = ValidationMiddleware.getValidationSchemas();
  }

  /**
   * Configuration des middlewares
   */
  private setupMiddlewares(app: express.Application): void {
    app.use(helmet()); // Sécurité HTTP
    app.use(cors()); // Gestion CORS
    app.use(express.json()); // Parsing JSON
    app.use(morgan("combined")); // Logging des requêtes
  }

  /**
   * Configuration des routes
   */
  setupRoutes(app: express.Application): void {
    this.setupMiddlewares(app);

    // ===== ROUTES DE SANTÉ =====
    app.get("/api/health", (req: Request, res: Response) => {
      this.healthController.healthCheck(req, res);
    });

    // ===== ROUTES D'AUTHENTIFICATION =====
    app.post(
      "/api/auth/register",
      ValidationMiddleware.validateRequest(
        this.validationSchemas.registerSchema
      ),
      (req: Request, res: Response) => {
        this.authController.register(req, res);
      }
    );

    app.post(
      "/api/auth/login",
      ValidationMiddleware.validateRequest(this.validationSchemas.loginSchema),
      (req: Request, res: Response) => {
        this.authController.login(req, res);
      }
    );

    // Routes admin (authentification gérée par l'API Gateway)
    app.post("/api/admin/auth/logout", (req: Request, res: Response) => {
      this.authController.logout(req, res);
    });

    // Route publique pour validation de mot de passe
    app.post(
      "/api/auth/validate-password",
      ValidationMiddleware.validateRequest(
        this.validationSchemas.passwordValidationSchema
      ),
      (req: Request, res: Response) => {
        this.authController.validatePassword(req, res);
      }
    );

    // ===== GESTION DES ERREURS GLOBALES =====
    app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
      console.error(err.stack);
      res.status(500).json({ error: "Erreur interne du serveur" });
    });

    // Handler pour les routes non trouvées (404)
    app.use("*", (_req: Request, res: Response) => {
      res.status(404).json({ error: "Route non trouvée" });
    });
  }
}
