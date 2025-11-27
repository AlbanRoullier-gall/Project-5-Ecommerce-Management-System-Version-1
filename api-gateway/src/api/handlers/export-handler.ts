/**
 * Handler pour l'export
 * Fait des appels directs aux services Order et PDF Export
 */

import { Request, Response } from "express";
import { SERVICES } from "../../config";
import {
  YearExportRequestDTO,
  OrderExportData,
  CreditNoteExportData,
} from "../../../../shared-types/pdf-export-service";

/**
 * Exporte les commandes et avoirs pour une année spécifique
 * Appels directs aux services sans transformations
 */
export const handleExportOrdersYear = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { year } = req.params;

    const yearNumber = parseInt(year || "");
    if (isNaN(yearNumber) || yearNumber < 2025) {
      res.status(400).json({
        error: "Année invalide. L'année doit être >= 2025",
      });
      return;
    }

    const user = (req as any).user;
    if (!user) {
      res.status(401).json({ error: "Utilisateur non authentifié" });
      return;
    }

    // 1. Appel direct au Order Service

    const orderServiceResponse = await fetch(
      `${SERVICES.order}/api/admin/orders/year/${yearNumber}/export-data`,
      {
        headers: {
          "x-user-id": String(user.userId),
          "x-user-email": user.email,
          "Content-Type": "application/json",
        },
      }
    );

    if (!orderServiceResponse.ok) {
      const errorData = await orderServiceResponse.json();
      res.status(orderServiceResponse.status).json(errorData);
      return;
    }

    const orderData = (await orderServiceResponse.json()) as {
      success: boolean;
      year: number;
      data: {
        orders: OrderExportData[];
        creditNotes: CreditNoteExportData[];
      };
    };

    if (!orderData.success) {
      res
        .status(500)
        .json({ error: "Erreur lors de la récupération des données" });
      return;
    }

    // 2. Appel direct au PDF Export Service

    const exportRequest: YearExportRequestDTO = {
      year: yearNumber,
      orders: orderData.data.orders,
      creditNotes: orderData.data.creditNotes,
    };

    const pdfServiceResponse = await fetch(
      `${SERVICES["pdf-export"]}/api/admin/export/orders-year`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": String(user.userId),
          "x-user-email": user.email,
        },
        body: JSON.stringify(exportRequest),
      }
    );

    if (!pdfServiceResponse.ok) {
      const errorText = await pdfServiceResponse.text();
      console.error(
        `❌ Erreur du service pdf-export (${pdfServiceResponse.status}):`,
        errorText
      );
      res.status(500).json({
        error: "Erreur lors de la génération du PDF",
        details: errorText.substring(0, 500), // Limiter la taille de l'erreur
      });
      return;
    }

    // 3. Retourner le HTML au client
    const htmlBuffer = await pdfServiceResponse.arrayBuffer();

    res.setHeader("Content-Type", "text/html");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="export-commandes-${yearNumber}.html"`
    );
    res.setHeader("Content-Length", htmlBuffer.byteLength.toString());

    res.send(Buffer.from(htmlBuffer));
  } catch (error) {
    console.error("Erreur lors de l'export:", error);
    res.status(500).json({
      error: "Erreur interne du serveur",
      message: error instanceof Error ? error.message : "Erreur inconnue",
    });
  }
};
