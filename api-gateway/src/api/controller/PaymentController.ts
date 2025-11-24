/**
 * PaymentController
 * Gère les routes de paiement - Proxy simple vers payment-service
 */

import { Request, Response } from "express";
import axios from "axios";
import { SERVICES } from "../../config";

export class PaymentController {
  // ===== ROUTES PUBLIQUES PROXY =====

  createPayment = async (req: Request, res: Response): Promise<void> => {
    // Le frontend envoie { cartSessionId, snapshot, payment }
    // Mais payment-service attend directement { customer, items, ... }
    // On doit extraire payment et passer le snapshot dans les metadata Stripe
    const body = req.body as any;

    if (body.payment && body.cartSessionId && body.snapshot) {
      // Encoder le snapshot en JSON pour le passer dans les metadata Stripe
      // Les metadata Stripe ont une limite de 500 caractères par clé, donc on encode tout en une seule clé
      if (!body.payment.metadata) {
        body.payment.metadata = {};
      }

      // Passer cartSessionId et snapshot encodé dans les metadata
      body.payment.metadata.cartSessionId = body.cartSessionId;
      body.payment.metadata.checkoutSnapshot = JSON.stringify(body.snapshot);

      // Modifier le body pour ne contenir que payment
      req.body = body.payment;
    }

    // Faire l'appel manuellement pour intercepter la réponse
    try {
      const targetUrl = `${SERVICES.payment}${req.path}`;
      const response = await axios({
        method: req.method,
        url: targetUrl,
        headers: {
          "Content-Type": "application/json",
        },
        data: req.body,
        responseType: "arraybuffer",
      });

      // Parser la réponse
      const contentType = (response.headers["content-type"] as string) || "";
      let responseData: any;
      if (contentType.includes("application/json")) {
        const text = Buffer.isBuffer(response.data)
          ? response.data.toString("utf8")
          : String(response.data);
        responseData = JSON.parse(text);
      }

      // Envoyer la réponse au client
      if (contentType.includes("application/json")) {
        res.status(response.status).json(responseData);
      } else {
        if (contentType) res.set("Content-Type", contentType);
        res.status(response.status).send(response.data);
      }
    } catch (error: any) {
      if (error.response) {
        const status = error.response.status;
        const responseData = error.response.data;
        let errorData: any;
        if (
          Buffer.isBuffer(responseData) ||
          responseData instanceof ArrayBuffer
        ) {
          try {
            const buffer = Buffer.isBuffer(responseData)
              ? responseData
              : Buffer.from(
                  responseData instanceof ArrayBuffer
                    ? new Uint8Array(responseData)
                    : responseData
                );
            errorData = JSON.parse(buffer.toString("utf8"));
          } catch {
            const errorBuffer = Buffer.isBuffer(responseData)
              ? responseData
              : Buffer.from(
                  responseData instanceof ArrayBuffer
                    ? new Uint8Array(responseData)
                    : responseData
                );
            errorData = {
              error: "Service Error",
              message: errorBuffer.toString("utf8"),
              status: status,
            };
          }
        } else {
          errorData = responseData;
        }
        res.status(status).json(errorData);
      } else {
        res.status(500).json({
          error: "Service Error",
          message: "Erreur de communication avec le service",
        });
      }
    }
  };

  finalizePayment = async (req: Request, res: Response): Promise<void> => {
    const { handleFinalizePayment } = await import(
      "../handlers/payment-handler"
    );
    await handleFinalizePayment(req, res);
  };
}
