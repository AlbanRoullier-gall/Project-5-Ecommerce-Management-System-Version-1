/**
 * PaymentController
 * Gère les routes de paiement - Proxy simple vers payment-service
 */

import { Request, Response } from "express";
import { checkoutSnapshots } from "./CartController";

// Mapping Stripe session_id → cartSessionId
const stripeSessionToCartSession = new Map<string, string>();

export class PaymentController {
  // ===== ROUTES PUBLIQUES PROXY =====

  createPayment = async (req: Request, res: Response): Promise<void> => {
    // Le frontend envoie { cartSessionId, snapshot, payment }
    // Mais payment-service attend directement { customer, items, ... }
    // On doit extraire payment et stocker le snapshot
    const body = req.body as any;
    const originalBody = { ...body };

    if (body.payment && body.cartSessionId) {
      // Stocker le snapshot dans CartController
      checkoutSnapshots.set(body.cartSessionId, body.snapshot);
      console.log(
        `[PaymentController] Snapshot stored for cartSessionId: ${body.cartSessionId}`
      );
      console.log(
        `[PaymentController] Snapshot keys: ${Array.from(
          checkoutSnapshots.keys()
        ).join(", ")}`
      );

      // Ajouter cartSessionId dans les métadonnées Stripe pour pouvoir le récupérer plus tard
      if (!body.payment.metadata) {
        body.payment.metadata = {};
      }
      body.payment.metadata.cartSessionId = body.cartSessionId;

      // Modifier le body pour ne contenir que payment
      req.body = body.payment;
    }

    // Faire l'appel manuellement pour intercepter la réponse
    const { SERVICES } = await import("../../config");
    const axios = (await import("axios")).default;

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

        // Stocker le mapping session_id → cartSessionId
        if (responseData?.payment?.id && originalBody.cartSessionId) {
          stripeSessionToCartSession.set(
            responseData.payment.id,
            originalBody.cartSessionId
          );
          console.log(
            `[PaymentController] Mapped Stripe session ${responseData.payment.id} → cartSessionId ${originalBody.cartSessionId}`
          );
        }
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
    await handleFinalizePayment(req, res, stripeSessionToCartSession);
  };
}

// Export pour utilisation dans payment-handler
export { stripeSessionToCartSession };
