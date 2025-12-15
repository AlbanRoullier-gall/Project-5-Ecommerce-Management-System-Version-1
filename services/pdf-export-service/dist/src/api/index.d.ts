/**
 * Routeur API - Service PDF Export
 * Configuration centralisée des routes pour pdf-export-service
 */
import { Application } from "express";
export declare class ApiRouter {
    private healthController;
    private exportController;
    constructor();
    /**
     * Configuration des middlewares
     */
    private setupMiddlewares;
    /**
     * Configuration des schémas de validation
     */
    private setupValidationSchemas;
    /**
     * Middleware de validation
     */
    private validateRequest;
    /**
     * Middleware d'authentification pour les routes admin
     */
    private requireAuth;
    /**
     * Configuration des routes
     */
    setupRoutes(app: Application): void;
}
//# sourceMappingURL=index.d.ts.map