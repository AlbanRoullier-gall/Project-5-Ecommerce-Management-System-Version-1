/**
 * Export Handler
 * Handles PDF export requests for orders and credit notes by year
 */

import { Request, Response } from "express";
import { SERVICES } from "../../config";

export class ExportHandler {
  /**
   * Export orders and credit notes for a specific year as PDF
   */
  async exportOrdersYear(req: Request, res: Response): Promise<void> {
    try {
      const { year } = req.params;

      const yearNumber = parseInt(year || "");
      if (isNaN(yearNumber) || yearNumber < 2025) {
        res.status(400).json({
          error: "Année invalide. L'année doit être >= 2025",
        });
        return;
      }

      // Step 1: Get data from order service
      console.log(`Fetching export data for year ${yearNumber}...`);

      // Extract user info from the request (set by requireAuth middleware)
      // requireAuth middleware already verified the token, so req.user is guaranteed to exist
      const user = (req as any).user;
      if (!user) {
        // This should never happen if requireAuth middleware is properly applied
        res.status(401).json({ error: "Utilisateur non authentifié" });
        return;
      }

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

      const orderData = (await orderServiceResponse.json()) as any;

      if (!orderData.success) {
        res
          .status(500)
          .json({ error: "Erreur lors de la récupération des données" });
        return;
      }

      // Debug: Log orders data before sending to PDF service
      console.log("📦 Orders from order service:", {
        ordersCount: orderData.data?.orders?.length || 0,
        creditNotesCount: orderData.data?.creditNotes?.length || 0,
      });

      // Debug: Log credit notes data before sending to PDF service
      console.log("📦 Credit Notes from order service:", {
        creditNotesCount: orderData.data?.creditNotes?.length || 0,
        firstCreditNote: orderData.data?.creditNotes?.[0]
          ? {
              id: orderData.data.creditNotes[0].id,
              hasItems: !!orderData.data.creditNotes[0].items,
              itemsCount: orderData.data.creditNotes[0].items?.length || 0,
              items: orderData.data.creditNotes[0].items,
              allProperties: Object.keys(orderData.data.creditNotes[0]),
            }
          : null,
      });

      // Step 2: Generate PDF using PDF export service
      console.log(`Generating PDF for year ${yearNumber}...`);

      const requestBody = {
        year: yearNumber,
        orders: orderData.data.orders,
        creditNotes: orderData.data.creditNotes,
      };

      const jsonBody = JSON.stringify(requestBody);
      const bodySizeMB = (jsonBody.length / 1024 / 1024).toFixed(2);
      console.log(
        `📦 Envoi au service pdf-export: ${orderData.data.orders.length} commandes, ${orderData.data.creditNotes.length} avoirs, taille: ${bodySizeMB} MB`
      );

      const pdfServiceResponse = await fetch(
        `${SERVICES["pdf-export"]}/api/admin/export/orders-year`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": String(user.userId),
            "x-user-email": user.email,
          },
          body: jsonBody,
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

      // Step 3: Return HTML to client
      const htmlBuffer = await pdfServiceResponse.arrayBuffer();

      res.setHeader("Content-Type", "text/html");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="export-commandes-${yearNumber}.html"`
      );
      res.setHeader("Content-Length", htmlBuffer.byteLength.toString());

      res.send(Buffer.from(htmlBuffer));
    } catch (error) {
      console.error("Export error:", error);
      res.status(500).json({
        error: "Erreur interne du serveur",
        message: error instanceof Error ? error.message : "Erreur inconnue",
      });
    }
  }
}
