/**
 * Payment Controller - Version simplifiée pour Stripe
 * HTTP request handling pour les opérations de paiement
 */

import { Request, Response } from "express";
import PaymentService from "../../services/PaymentService";
import { PaymentMapper, ResponseMapper } from "../mapper";
import { PaymentCreateDTO, PaymentConfirmDTO, PaymentRefundDTO } from "../dto";

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
   * Confirmer un paiement
   */
  async confirmPayment(req: Request, res: Response): Promise<void> {
    try {
      const confirmData = PaymentMapper.paymentConfirmDTOToStripeData(
        req.body as PaymentConfirmDTO
      );
      const result = await this.paymentService.confirmPayment(
        confirmData.paymentIntentId
      );
      res
        .status(200)
        .json(
          ResponseMapper.paymentConfirmed(
            PaymentMapper.stripePaymentIntentToPublicDTO(result)
          )
        );
    } catch (error: any) {
      console.error("Confirm payment error:", error);
      if (error.message.includes("card")) {
        res.status(402).json(ResponseMapper.paymentError(error.message));
        return;
      }
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Rembourser un paiement
   */
  async refundPayment(req: Request, res: Response): Promise<void> {
    try {
      const refundData = PaymentMapper.paymentRefundDTOToStripeData(
        req.body as PaymentRefundDTO
      );
      const result = await this.paymentService.refundPayment(
        refundData.paymentIntentId,
        refundData.amount,
        refundData.reason
      );
      res
        .status(200)
        .json(
          ResponseMapper.paymentRefunded(
            PaymentMapper.stripeRefundToPublicDTO(result, {})
          )
        );
    } catch (error: any) {
      console.error("Refund payment error:", error);
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Récupérer un paiement par ID
   */
  async getPayment(req: Request, res: Response): Promise<void> {
    try {
      const { paymentId } = req.params;
      const result = await this.paymentService.getPayment(paymentId);
      res
        .status(200)
        .json(
          ResponseMapper.paymentCreated(
            PaymentMapper.stripePaymentIntentToPublicDTO(result)
          )
        );
    } catch (error: any) {
      console.error("Get payment error:", error);
      if (error.message.includes("not found")) {
        res.status(404).json(ResponseMapper.notFoundError("Paiement"));
        return;
      }
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Récupérer les statistiques de paiement
   */
  async getPaymentStats(req: Request, res: Response): Promise<void> {
    try {
      const { period = "month" } = req.query;
      const stats = await this.paymentService.getPaymentStats(period as string);
      res.json(ResponseMapper.paymentStats(stats));
    } catch (error: any) {
      console.error("Get payment stats error:", error);
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }
}
