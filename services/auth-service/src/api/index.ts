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
        email: Joi.string().email().required().label("Email").messages({
          "string.empty": "L'email est requis",
          "string.email": "L'email doit être une adresse email valide",
          "any.required": "L'email est requis",
        }),
        password: Joi.string()
          .min(8)
          .required()
          .label("Mot de passe")
          .messages({
            "string.empty": "Le mot de passe est requis",
            "string.min": "Le mot de passe doit contenir au moins 8 caractères",
            "any.required": "Le mot de passe est requis",
          }),
        confirmPassword: Joi.string()
          .optional()
          .label("Confirmation du mot de passe"),
        firstName: Joi.string().max(100).required().label("Prénom").messages({
          "string.empty": "Le prénom est requis",
          "string.max": "Le prénom ne doit pas dépasser 100 caractères",
          "any.required": "Le prénom est requis",
        }),
        lastName: Joi.string().max(100).required().label("Nom").messages({
          "string.empty": "Le nom est requis",
          "string.max": "Le nom ne doit pas dépasser 100 caractères",
          "any.required": "Le nom est requis",
        }),
      }),

      loginSchema: Joi.object({
        email: Joi.string().email().required().label("Email").messages({
          "string.empty": "L'email est requis",
          "string.email": "L'email doit être une adresse email valide",
          "any.required": "L'email est requis",
        }),
        password: Joi.string().required().label("Mot de passe").messages({
          "string.empty": "Le mot de passe est requis",
          "any.required": "Le mot de passe est requis",
        }),
      }),

      passwordValidationSchema: Joi.object({
        password: Joi.string().required().label("Mot de passe").messages({
          "string.empty": "Le mot de passe est requis",
          "any.required": "Le mot de passe est requis",
        }),
      }),

      resetPasswordSchema: Joi.object({
        email: Joi.string().email().required().label("Email").messages({
          "string.empty": "L'email est requis",
          "string.email": "L'email doit être une adresse email valide",
          "any.required": "L'email est requis",
        }),
      }),

      confirmResetPasswordSchema: Joi.object({
        token: Joi.string().required().label("Token").messages({
          "string.empty": "Le token est requis",
          "any.required": "Le token est requis",
        }),
        password: Joi.string()
          .min(8)
          .required()
          .label("Mot de passe")
          .messages({
            "string.empty": "Le mot de passe est requis",
            "string.min": "Le mot de passe doit contenir au moins 8 caractères",
            "any.required": "Le mot de passe est requis",
          }),
      }),
    };
  }

  /**
   * Middleware de validation
   */
  private validateRequest = (schema: Joi.ObjectSchema) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      const { error } = schema.validate(req.body, {
        abortEarly: false,
        messages: {
          "string.empty": "Le champ {#label} est requis",
          "string.min":
            "Le champ {#label} doit contenir au moins {#limit} caractères",
          "string.max":
            "Le champ {#label} ne doit pas dépasser {#limit} caractères",
          "string.email":
            "Le champ {#label} doit être une adresse email valide",
          "any.required": "Le champ {#label} est requis",
          "any.only":
            "Le champ {#label} doit être l'une des valeurs suivantes: {#valids}",
        },
      });
      if (error) {
        const messages = error.details.map((detail) => detail.message);
        res
          .status(400)
          .json(
            ResponseMapper.validationError(
              messages.join("; ") || "Erreur de validation"
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


    // ===== ROUTES ADMIN (AVEC AUTHENTIFICATION) =====
    app.post(
      "/api/admin/auth/logout",
      this.requireAuth,
      (req: Request, res: Response) => {
        this.authController.logout(req, res);
      }
    );

    // ===== ROUTES GESTION UTILISATEURS (SUPER ADMIN) =====
    app.get(
      "/api/admin/users/pending",
      this.requireAuth,
      (req: Request, res: Response) => {
        this.authController.getPendingUsers(req, res);
      }
    );

    app.get(
      "/api/admin/users",
      this.requireAuth,
      (req: Request, res: Response) => {
        this.authController.getAllUsers(req, res);
      }
    );

    app.get(
      "/api/admin/users/:id",
      this.requireAuth,
      (req: Request, res: Response) => {
        this.authController.getUserById(req, res);
      }
    );

    app.post(
      "/api/admin/users/:id/approve",
      this.requireAuth,
      (req: Request, res: Response) => {
        this.authController.approveUser(req, res);
      }
    );

    app.post(
      "/api/admin/users/:id/reject",
      this.requireAuth,
      (req: Request, res: Response) => {
        this.authController.rejectUser(req, res);
      }
    );

    app.delete(
      "/api/admin/users/:id",
      this.requireAuth,
      (req: Request, res: Response) => {
        this.authController.deleteUser(req, res);
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
