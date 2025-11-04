/**
 * ExportController
 * Gère les routes d'export
 */

import { Request, Response } from "express";
import { proxyRequest } from "../proxy";
import { ExportHandler } from "../handlers/export-handler";

export class ExportController {
  private exportHandler: ExportHandler;

  /**
   * Proxy vers le service pdf-export
   */
  private async proxyToPdfExport(req: Request, res: Response): Promise<void> {
    await proxyRequest(req, res, "pdf-export");
  }

  constructor() {
    this.exportHandler = new ExportHandler();
  }

  // ===== ROUTES ADMIN PROXY =====

  exportOrdersYearPost = async (req: Request, res: Response): Promise<void> => {
    await this.proxyToPdfExport(req, res);
  };

  // ===== ROUTES ORCHESTRÉES =====

  exportOrdersYear = async (req: Request, res: Response): Promise<void> => {
    await this.exportHandler.exportOrdersYear(req, res);
  };
}
