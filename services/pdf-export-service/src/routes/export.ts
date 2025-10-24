import express from "express";
import { PDFGenerator } from "../services/pdfGenerator";
import { YearExportRequest, ExportResponse } from "../types";

const router = express.Router();
const pdfGenerator = new PDFGenerator();

router.post("/generate/orders-year-export", async (req, res) => {
  try {
    const data: YearExportRequest = req.body;

    if (!data.year || !data.orders || !data.creditNotes) {
      return res.status(400).json({
        success: false,
        error: "Données manquantes: year, orders et creditNotes sont requis",
      });
    }

    const htmlBuffer = await pdfGenerator.generateOrdersYearExport(data);

    res.setHeader("Content-Type", "text/html");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="export-commandes-${data.year}.html"`
    );
    res.send(htmlBuffer);
  } catch (error) {
    console.error("Erreur lors de la génération du PDF:", error);
    const response: ExportResponse = {
      success: false,
      error: error instanceof Error ? error.message : "Erreur inconnue",
    };
    res.status(500).json(response);
  }
});

export { router as exportRoutes };
