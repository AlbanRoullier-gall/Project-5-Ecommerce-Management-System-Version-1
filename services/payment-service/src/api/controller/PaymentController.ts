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
}
