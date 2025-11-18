/**
 * Export Handler
 * Gère les requêtes d'export PDF des commandes et avoirs par année
 */

import { Request, Response } from "express";
import { SERVICES } from "../../config";

export class ExportHandler {
  /**
   * Exporte les commandes et avoirs pour une année spécifique en HTML
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

      // Étape 1 : Récupérer les données depuis le service order-service

      // Extraire les informations utilisateur de la requête (définies par le middleware requireAuth)
      // Le middleware requireAuth a déjà vérifié le token, donc req.user est garanti d'exister
      const user = (req as any).user;
      if (!user) {
        // Cela ne devrait jamais arriver si le middleware requireAuth est correctement appliqué
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

      // Étape 2 : Générer le HTML via le service pdf-export

      const requestBody = {
        year: yearNumber,
        orders: orderData.data.orders,
        creditNotes: orderData.data.creditNotes,
      };

      const jsonBody = JSON.stringify(requestBody);

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

      // Étape 3 : Retourner le HTML au client
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
  }
}
