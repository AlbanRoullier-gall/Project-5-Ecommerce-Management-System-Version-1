"use strict";
/**
 * Routeur API - Service PDF Export
 * Configuration centralisée des routes pour pdf-export-service
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiRouter = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const joi_1 = __importDefault(require("joi"));
const morgan_1 = __importDefault(require("morgan"));
const index_1 = require("./controller/index");
const index_2 = require("./mapper/index");
class ApiRouter {
    constructor() {
        /**
         * Middleware de validation
         */
        this.validateRequest = (schema) => {
            return (req, res, next) => {
                const { error } = schema.validate(req.body);
                if (error) {
                    res
                        .status(400)
                        .json(index_2.ResponseMapper.validationError(error.details[0]?.message || "Validation error"));
                    return;
                }
                next();
            };
        };
        /**
         * Middleware d'authentification pour les routes admin
         */
        this.requireAuth = (req, res, next) => {
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
            req.user = {
                userId: Number(userId),
                email: userEmail,
            };
            next();
        };
        this.healthController = new index_1.HealthController();
        this.exportController = new index_1.ExportController();
    }
    /**
     * Configuration des middlewares
     */
    setupMiddlewares(app) {
        app.use((0, helmet_1.default)());
        app.use((0, cors_1.default)());
        app.use((0, morgan_1.default)("combined"));
        app.use(express_1.default.json({ limit: "50mb" }));
        app.use(express_1.default.urlencoded({ extended: true, limit: "50mb" }));
    }
    /**
     * Configuration des schémas de validation
     */
    setupValidationSchemas() {
        return {
            // Schéma d'export d'année (simplifié)
            yearExportSchema: joi_1.default.object({
                year: joi_1.default.number().integer().min(2000).max(2100).required(),
                orders: joi_1.default.array().items(joi_1.default.object()).required(),
                creditNotes: joi_1.default.array().items(joi_1.default.object()).required(),
            }),
            // Schéma d'export de facture (simplifié)
            orderInvoiceSchema: joi_1.default.object({
                order: joi_1.default.object().required(),
            }),
        };
    }
    /**
     * Configuration des routes
     */
    setupRoutes(app) {
        this.setupMiddlewares(app);
        const schemas = this.setupValidationSchemas();
        // ===== ROUTES DE SANTÉ =====
        app.get("/api/health", (req, res) => {
            this.healthController.healthCheck(req, res);
        });
        app.get("/api/health/detailed", (req, res) => {
            this.healthController.detailedHealthCheck(req, res);
        });
        // ===== ROUTES D'EXPORT =====
        // Export d'une facture pour une commande (ROUTE ADMIN)
        app.post("/api/admin/export/order-invoice", this.requireAuth, this.validateRequest(schemas.orderInvoiceSchema), (req, res) => {
            this.exportController.generateOrderInvoice(req, res);
        });
        // Export des commandes par année (ROUTE ADMIN)
        app.post("/api/admin/export/orders-year", this.requireAuth, this.validateRequest(schemas.yearExportSchema), (req, res) => {
            this.exportController.generateOrdersYearExport(req, res);
        });
        // ===== GESTION DES ERREURS =====
        app.use((req, res) => {
            res.status(404).json(index_2.ResponseMapper.notFoundError("Route"));
        });
        app.use((error, req, res, next) => {
            console.error("Unhandled error:", error);
            res.status(500).json(index_2.ResponseMapper.internalServerError());
        });
    }
}
exports.ApiRouter = ApiRouter;
//# sourceMappingURL=index.js.map