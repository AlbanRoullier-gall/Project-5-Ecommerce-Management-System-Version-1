/**
 * ExportController
 * Gère les routes d'export
 */

import { Request, Response } from "express";
import { proxyRequest } from "../../core/proxy";
import { ExportHandler } from "../../handlers/export-handler";

export class ExportController {
  private exportHandler: ExportHandler;

  /**
   * Proxy vers le service pdf-export
   */
  private async proxyToPdfExport(req: Request, res: Response): Promise<void> {
    await proxyRequest(req, res, "pdf-export");
  }

  /**
   * Wrapper pour les handlers
   */
  private wrapHandler(
    handler: (req: Request, res: Response) => Promise<any> | any
  ) {
    return async (req: Request, res: Response): Promise<void> => {
      await handler(req, res);
    };
  }

  constructor() {
    this.exportHandler = new ExportHandler();
  }

  // ===== ROUTES ADMIN PROXY =====

  exportOrdersYearPost = this.wrapHandler(this.proxyToPdfExport);

  // ===== ROUTES ORCHESTRÉES =====

  exportOrdersYear = (req: Request, res: Response): Promise<void> => {
    return this.wrapHandler(
      this.exportHandler.exportOrdersYear.bind(this.exportHandler)
    )(req, res);
  };
}
