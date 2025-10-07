/**
 * API Router
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
import Joi from "joi";
import { AuthService } from "../services/AuthService";
import morgan from "morgan";
import { AuthController, HealthController } from "./controller";
import { ResponseMapper } from "./mapper/ResponseMapper";

export class ApiRouter {
  private authController: AuthController;
  private healthController: HealthController;

  constructor(pool: Pool) {
    const authService = new AuthService(pool);
    this.authController = new AuthController(authService);
    this.healthController = new HealthController();
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
   * Middleware d'authentification pour les routes admin
   * Vérifie les headers transmis par l'API-Gateway
   */
  private requireAuth = (
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    const userId = req.headers["x-user-id"];
    const userEmail = req.headers["x-user-email"];

    if (!userId || !userEmail) {
      res.status(401).json({
        error: "Erreur d'authentification",
        message: "Informations utilisateur manquantes",
        timestamp: new Date().toISOString(),
        status: 401,
      });
      return;
    }

    // Ajouter les informations utilisateur à la requête
    (req as any).user = {
      userId: Number(userId),
      email: userEmail,
    };

    next();
  };

  /**
   * Configuration des schémas de validation
   */
  private setupValidationSchemas(): any {
    return {
      registerSchema: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(8).required(),
        confirmPassword: Joi.string().optional(),
        firstName: Joi.string().max(100).required(),
        lastName: Joi.string().max(100).required(),
      }),

      loginSchema: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required(),
      }),

      passwordValidationSchema: Joi.object({
        password: Joi.string().min(8).required(),
      }),

      updateProfileSchema: Joi.object({
        firstName: Joi.string().max(100).optional(),
        lastName: Joi.string().max(100).optional(),
        email: Joi.string().email().optional(),
      }),

      changePasswordSchema: Joi.object({
        currentPassword: Joi.string().required(),
        newPassword: Joi.string().min(8).required(),
      }),

      resetPasswordSchema: Joi.object({
        email: Joi.string().email().required(),
      }),

      confirmResetPasswordSchema: Joi.object({
        token: Joi.string().required(),
        password: Joi.string().min(8).required(),
      }),
    };
  }

  /**
   * Middleware de validation
   */
  private validateRequest = (schema: Joi.ObjectSchema) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      const { error } = schema.validate(req.body);
      if (error) {
        res
          .status(400)
          .json(
            ResponseMapper.validationError(
              error.details[0]?.message || "Validation error"
            )
          );
        return;
      }
      next();
    };
  };

  /**
   * Configuration des routes
   */
  setupRoutes(app: express.Application): void {
    this.setupMiddlewares(app);
    const schemas = this.setupValidationSchemas();

    // ===== ROUTES DE SANTÉ =====
    app.get("/api/health", (req: Request, res: Response) => {
      this.healthController.healthCheck(req, res);
    });

    app.get("/api/health/detailed", (req: Request, res: Response) => {
      this.healthController.detailedHealthCheck(req, res);
    });

    // ===== ROUTES D'AUTHENTIFICATION =====
    app.post(
      "/api/auth/register",
      this.validateRequest(schemas.registerSchema),
      (req: Request, res: Response) => {
        this.authController.register(req, res);
      }
    );

    app.post(
      "/api/auth/login",
      this.validateRequest(schemas.loginSchema),
      (req: Request, res: Response) => {
        this.authController.login(req, res);
      }
    );

    app.post(
      "/api/auth/validate-password",
      this.validateRequest(schemas.passwordValidationSchema),
      (req: Request, res: Response) => {
        this.authController.validatePassword(req, res);
      }
    );

    app.post(
      "/api/auth/reset-password",
      this.validateRequest(schemas.resetPasswordSchema),
      (req: Request, res: Response) => {
        this.authController.resetPassword(req, res);
      }
    );

    app.post(
      "/api/auth/reset-password/confirm",
      this.validateRequest(schemas.confirmResetPasswordSchema),
      (req: Request, res: Response) => {
        this.authController.confirmResetPassword(req, res);
      }
    );

    // ===== ROUTES D'APPROBATION BACKOFFICE =====
    app.get("/api/auth/approve-backoffice", (req: Request, res: Response) => {
      this.authController.approveBackofficeAccess(req, res);
    });

    app.get("/api/auth/reject-backoffice", (req: Request, res: Response) => {
      this.authController.rejectBackofficeAccess(req, res);
    });

    // ===== ROUTES ADMIN (AVEC AUTHENTIFICATION) =====
    app.get(
      "/api/admin/auth/profile",
      this.requireAuth,
      (req: Request, res: Response) => {
        this.authController.getProfile(req, res);
      }
    );

    app.put(
      "/api/admin/auth/profile",
      this.requireAuth,
      this.validateRequest(schemas.updateProfileSchema),
      (req: Request, res: Response) => {
        this.authController.updateProfile(req, res);
      }
    );

    app.put(
      "/api/admin/auth/change-password",
      this.requireAuth,
      this.validateRequest(schemas.changePasswordSchema),
      (req: Request, res: Response) => {
        this.authController.changePassword(req, res);
      }
    );

    app.post(
      "/api/admin/auth/logout",
      this.requireAuth,
      (req: Request, res: Response) => {
        this.authController.logout(req, res);
      }
    );

    // ===== GESTION DES ERREURS GLOBALES =====
    app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
      console.error(err.stack);
      res.status(500).json(ResponseMapper.internalServerError());
    });

    // Handler pour les routes non trouvées (404)
    app.use("*", (_req: Request, res: Response) => {
      res.status(404).json(ResponseMapper.error("Route non trouvée", 404));
    });
  }
}
