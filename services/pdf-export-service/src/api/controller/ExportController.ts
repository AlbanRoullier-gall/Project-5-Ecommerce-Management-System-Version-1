/**
 * Contrôleur d'Export - Service PDF Export
 * Gestion des requêtes HTTP pour les opérations d'export
 */

import { Request, Response } from "express";
import { PDFGenerator } from "../../services/pdfGenerator";
import { ResponseMapper } from "../mapper/index";
import { YearExportRequestDTO } from "../dto";

export class ExportController {
  private pdfGenerator: PDFGenerator;

  constructor() {
    this.pdfGenerator = new PDFGenerator();
  }

  /**
   * Générer un export des commandes par année
   */
  async generateOrdersYearExport(req: Request, res: Response): Promise<void> {
    try {
      console.log("📥 Réception de la requête d'export...");
      const exportData = req.body as YearExportRequestDTO;

      // Log des données reçues pour debug
      console.log("📊 Données d'export reçues:", {
        year: exportData.year,
        ordersCount: exportData.orders?.length || 0,
        creditNotesCount: exportData.creditNotes?.length || 0,
        firstOrder: exportData.orders?.[0]
          ? {
              id: exportData.orders[0].id,
              hasItems: !!exportData.orders[0].items,
              itemsCount: exportData.orders[0].items?.length || 0,
              hasAddresses: !!exportData.orders[0].addresses,
              addressesCount: exportData.orders[0].addresses?.length || 0,
              properties: Object.keys(exportData.orders[0]),
            }
          : null,
        firstCreditNote: exportData.creditNotes?.[0]
          ? {
              id: exportData.creditNotes[0].id,
              hasItems: !!exportData.creditNotes[0].items,
              itemsCount: exportData.creditNotes[0].items?.length || 0,
              items: exportData.creditNotes[0].items,
              properties: Object.keys(exportData.creditNotes[0]),
            }
          : null,
      });

      console.log("🔄 Génération du HTML...");
      const htmlBuffer = await this.pdfGenerator.generateOrdersYearExport(
        exportData
      );
      console.log(
        `✅ HTML généré: ${(htmlBuffer.length / 1024 / 1024).toFixed(2)} MB`
      );

      res.setHeader("Content-Type", "text/html");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="export-commandes-${exportData.year}.html"`
      );
      console.log("📤 Envoi de la réponse...");
      res.send(htmlBuffer);
      console.log("✅ Réponse envoyée avec succès");
    } catch (error: any) {
      console.error("❌ Export generation error:", error);
      console.error("❌ Stack trace:", error.stack);
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }
}
