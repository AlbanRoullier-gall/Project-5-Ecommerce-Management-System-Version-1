"use strict";
/**
 * Contrôleur de Santé - Service PDF Export
 * Points de terminaison de vérification de santé pour pdf-export-service
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthController = void 0;
const index_1 = require("../mapper/index");
class HealthController {
    /**
     * Vérification de santé basique
     */
    healthCheck(req, res) {
        res.json(index_1.ResponseMapper.healthSuccess());
    }
    /**
     * Vérification de santé détaillée avec l'état du service
     */
    async detailedHealthCheck(req, res) {
        try {
            res.json({
                ...index_1.ResponseMapper.healthSuccess(),
                serviceInfo: {
                    name: "pdf-export-service",
                    version: "1.0.0",
                    description: "Service de génération d'exports PDF/HTML",
                    capabilities: ["orders-year-export"],
                },
            });
        }
        catch (error) {
            console.error("Health check error:", error);
            res.status(500).json(index_1.ResponseMapper.healthError());
        }
    }
}
exports.HealthController = HealthController;
//# sourceMappingURL=HealthController.js.map