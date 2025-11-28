/**
 * Contrôleur des Statistiques de Commandes
 * Gestion des requêtes HTTP pour les opérations de statistiques de commandes
 *
 * Architecture : Pattern Contrôleur
 * - Gestion des requêtes/réponses HTTP
 * - Orchestration des services
 * - Conversion des DTO
 */

import { Request, Response } from "express";
import OrderService from "../../services/OrderService";
import { OrderStatisticsRequestDTO } from "../dto/OrderStatisticsDTO";
import { ResponseMapper } from "../mapper";

export class OrderStatisticsController {
  private orderService: OrderService;

  constructor(orderService: OrderService) {
    this.orderService = orderService;
  }

  /**
   * Obtenir les statistiques de commandes
   */
  async getOrderStatistics(req: Request, res: Response): Promise<void> {
    try {
      const options: OrderStatisticsRequestDTO = {
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
        customerId: req.query.customerId
          ? parseInt(req.query.customerId as string)
          : undefined,
        status: req.query.status as string,
        year: req.query.year ? parseInt(req.query.year as string) : undefined,
      };

      const statistics = await this.orderService.getOrderStatistics(options);

      res.json(ResponseMapper.orderStatisticsRetrieved(statistics));
    } catch (error: any) {
      console.error("Get order statistics error:", error);
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Obtenir les statistiques formatées pour le dashboard
   */
  async getDashboardStatistics(req: Request, res: Response): Promise<void> {
    try {
      const year = req.query.year
        ? parseInt(req.query.year as string)
        : new Date().getFullYear();

      if (isNaN(year) || year < 2025) {
        res.status(400).json({
          error: "Année invalide",
          message: "L'année doit être >= 2025",
        });
        return;
      }

      const statistics = await this.orderService.getDashboardStatistics(year);

      res.json({
        success: true,
        data: {
          statistics,
          year,
        },
        timestamp: new Date().toISOString(),
        status: 200,
      });
    } catch (error: any) {
      console.error("Get dashboard statistics error:", error);
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }
}
