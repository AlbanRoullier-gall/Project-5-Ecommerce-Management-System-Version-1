/**
 * Contrôleur de Paiement - Version simplifiée pour Stripe
 * Gestion des requêtes HTTP pour les opérations de paiement
 */

import { Request, Response } from "express";
import PaymentService from "../../services/PaymentService";
import { PaymentMapper, ResponseMapper } from "../mapper";
import { PaymentCreateDTO } from "../dto";

export class PaymentController {
  private paymentService: PaymentService;

  constructor(paymentService: PaymentService) {
    this.paymentService = paymentService;
  }

  /**
   * Créer un paiement
   */
  async createPayment(req: Request, res: Response): Promise<void> {
    try {
      const paymentData = PaymentMapper.paymentCreateDTOToStripeData(
        req.body as PaymentCreateDTO
      );
      const result = await this.paymentService.createPayment(paymentData);
      res
        .status(201)
        .json(
          ResponseMapper.paymentCreated(
            PaymentMapper.stripePaymentIntentToPublicDTO(result)
          )
        );
    } catch (error: any) {
      console.error("Create payment error:", error);
      if (error.message.includes("card")) {
        res.status(402).json(ResponseMapper.paymentError(error.message));
        return;
      }
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Créer un paiement depuis un panier
   * Accepte un panier complet et fait la transformation en interne
   */
  async createPaymentFromCart(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.paymentService.createPaymentFromCart(req.body);
      res
        .status(201)
        .json(
          ResponseMapper.paymentCreated(
            PaymentMapper.stripePaymentIntentToPublicDTO(result)
          )
        );
    } catch (error: any) {
      console.error("Create payment from cart error:", error);
      if (error.message.includes("vide")) {
        res.status(400).json(ResponseMapper.validationError(error.message));
        return;
      }
      if (error.message.includes("card")) {
        res.status(402).json(ResponseMapper.paymentError(error.message));
        return;
      }
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Récupérer les informations d'une session Stripe
   * Retourne la session complète et le paymentIntentId extrait
   */
  async getSessionInfo(req: Request, res: Response): Promise<void> {
    try {
      const { csid } = req.params;

      if (!csid) {
        res
          .status(400)
          .json(
            ResponseMapper.validationError(
              "csid (Checkout Session ID) est requis"
            )
          );
        return;
      }

      const { session, paymentIntentId } =
        await this.paymentService.getSessionInfo(csid);

      res
        .status(200)
        .json(ResponseMapper.sessionRetrieved(session, paymentIntentId));
    } catch (error: any) {
      console.error("Get session info error:", error);
      if (error.message.includes("non trouvée")) {
        res.status(404).json(ResponseMapper.notFoundError("Session Stripe"));
        return;
      }
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }
}
