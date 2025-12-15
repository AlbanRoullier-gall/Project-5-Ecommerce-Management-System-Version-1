/**
 * Contrôleur de Santé - Service PDF Export
 * Points de terminaison de vérification de santé pour pdf-export-service
 */
import { Request, Response } from "express";
export declare class HealthController {
    /**
     * Vérification de santé basique
     */
    healthCheck(req: Request, res: Response): void;
    /**
     * Vérification de santé détaillée avec l'état du service
     */
    detailedHealthCheck(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=HealthController.d.ts.map