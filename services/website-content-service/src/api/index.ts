/**
 * API Router
 * Centralized route configuration for website-content-service
 *
 * Architecture : Router pattern
 * - Centralized route management
 * - Middleware integration
 * - Request validation
 */

import express, { Request, Response, NextFunction } from "express";
import { Pool } from "pg";
import cors from "cors";
import helmet from "helmet";
import Joi from "joi";
import morgan from "morgan";
import WebsiteContentService from "../services/WebsiteContentService";
import {
  HealthController,
  WebsitePageController,
  WebsitePageVersionController,
} from "./controller";
import { ResponseMapper } from "./mapper";

export class ApiRouter {
  private healthController: HealthController;
  private websitePageController: WebsitePageController;
  private websitePageVersionController: WebsitePageVersionController;

  constructor(pool: Pool) {
    const websiteContentService = new WebsiteContentService(pool);
    this.healthController = new HealthController(pool);
    this.websitePageController = new WebsitePageController(
      websiteContentService
    );
    this.websitePageVersionController = new WebsitePageVersionController(
      websiteContentService
    );
  }

  /**
   * Setup middlewares
   */
  private setupMiddlewares(app: express.Application): void {
    app.use(helmet());
    app.use(cors());
    app.use(morgan("combined"));
    app.use(express.json({ limit: "50mb" }));
    app.use(express.urlencoded({ extended: true, limit: "50mb" }));
  }

  /**
   * Setup validation schemas
   */
  private setupValidationSchemas() {
    return {
      // Website page schemas
      pageCreateSchema: Joi.object({
        pageSlug: Joi.string().max(100).required(),
        pageTitle: Joi.string().max(255).required(),
        markdownContent: Joi.string().required(),
      }),
      pageUpdateSchema: Joi.object({
        pageSlug: Joi.string().max(100).optional(),
        pageTitle: Joi.string().max(255).optional(),
        markdownContent: Joi.string().optional(),
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

    // ===== ROUTES PUBLIQUES =====
    // List pages (public)
    app.get("/api/website-content/pages", (req: Request, res: Response) => {
      this.websitePageController.listPages(req, res);
    });

    // Get page by slug (public)
    app.get(
      "/api/website-content/pages/:slug",
      (req: Request, res: Response) => {
        this.websitePageController.getPageBySlug(req, res);
      }
    );

    // Get all page slugs (public)
    app.get("/api/website-content/slugs", (req: Request, res: Response) => {
      this.websitePageController.getAllSlugs(req, res);
    });

    // ===== ROUTES D'ADMINISTRATION =====
    // Page management
    app.post(
      "/api/admin/website-content/pages",
      this.validateRequest(schemas.pageCreateSchema),
      (req: Request, res: Response) => {
        this.websitePageController.createPage(req, res);
      }
    );

    app.get(
      "/api/admin/website-content/pages",
      (req: Request, res: Response) => {
        this.websitePageController.listPages(req, res);
      }
    );

    app.get(
      "/api/admin/website-content/pages/:slug",
      (req: Request, res: Response) => {
        this.websitePageController.getPageBySlug(req, res);
      }
    );

    app.put(
      "/api/admin/website-content/pages/:slug",
      this.validateRequest(schemas.pageUpdateSchema),
      (req: Request, res: Response) => {
        this.websitePageController.updatePage(req, res);
      }
    );

    app.delete(
      "/api/admin/website-content/pages/:slug",
      (req: Request, res: Response) => {
        this.websitePageController.deletePage(req, res);
      }
    );

    // Version management
    app.get(
      "/api/admin/website-content/pages/:slug/versions",
      (req: Request, res: Response) => {
        this.websitePageVersionController.listVersions(req, res);
      }
    );

    app.post(
      "/api/admin/website-content/pages/:slug/rollback",
      (req: Request, res: Response) => {
        this.websitePageVersionController.rollbackPage(req, res);
      }
    );

    app.delete(
      "/api/admin/website-content/pages/:slug/versions/:versionNumber",
      (req: Request, res: Response) => {
        this.websitePageVersionController.deleteVersion(req, res);
      }
    );

    // ===== GESTION DES ERREURS =====
    app.use((req: Request, res: Response) => {
      res.status(404).json(ResponseMapper.notFoundError("Route"));
    });

    app.use((error: any, req: Request, res: Response, next: NextFunction) => {
      console.error("Unhandled error:", error);
      res.status(500).json(ResponseMapper.internalServerError());
    });
  }
}
