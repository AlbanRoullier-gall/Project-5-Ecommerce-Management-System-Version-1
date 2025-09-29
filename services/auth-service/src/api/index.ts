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
import jwt from "jsonwebtoken";
import Joi from "joi";
import morgan from "morgan";
import { AuthService } from "../services/AuthService";
import { AuthController, HealthController } from "./controller";
import { JWTPayload } from "../models/JWTPayload";
import { ResponseMapper } from "./mapper/ResponseMapper";

export class ApiRouter {
  private authController: AuthController;
  private healthController: HealthController;
  private jwtSecret: string;

  constructor(pool: Pool) {
    const authService = new AuthService(pool);
    this.authController = new AuthController(authService);
    this.healthController = new HealthController();
    this.jwtSecret = process.env["JWT_SECRET"] || "your-jwt-secret-key";
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
   * Middleware d'authentification JWT
   */
  private authenticateToken = (
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      res
        .status(401)
        .json(ResponseMapper.authenticationError("Token d'accès requis"));
      return;
    }

    try {
      const decoded = jwt.verify(token, this.jwtSecret) as JWTPayload;
      (req as any).user = decoded;
      next();
    } catch (error) {
      res
        .status(403)
        .json(ResponseMapper.authenticationError("Token invalide"));
    }
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
        role: Joi.string().valid("customer").optional(),
      }),

      loginSchema: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required(),
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

    app.get(
      "/api/auth/profile",
      this.authenticateToken,
      (req: Request, res: Response) => {
        this.authController.getProfile(req, res);
      }
    );

    app.put(
      "/api/auth/profile",
      this.authenticateToken,
      this.validateRequest(schemas.updateProfileSchema),
      (req: Request, res: Response) => {
        this.authController.updateProfile(req, res);
      }
    );

    app.put(
      "/api/auth/change-password",
      this.authenticateToken,
      this.validateRequest(schemas.changePasswordSchema),
      (req: Request, res: Response) => {
        this.authController.changePassword(req, res);
      }
    );

    app.post(
      "/api/auth/logout",
      this.authenticateToken,
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
