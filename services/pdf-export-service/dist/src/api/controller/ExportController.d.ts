/**
 * Contrôleur d'Export - Service PDF Export
 * Gestion des requêtes HTTP pour les opérations d'export
 */
import { Request, Response } from "express";
export declare class ExportController {
    private pdfGenerator;
    constructor();
    /**
     * Générer une facture PDF pour une seule commande
     */
    generateOrderInvoice(req: Request, res: Response): Promise<void>;
    /**
     * Générer un export des commandes par année
     */
    generateOrdersYearExport(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=ExportController.d.ts.map