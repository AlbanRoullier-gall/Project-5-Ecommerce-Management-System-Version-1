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
import { OrderStatisticsRequestDTO } from "../dto";
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
      const options: Partial<OrderStatisticsRequestDTO> = {
        ...(req.query.startDate && {
          startDate: req.query.startDate as string,
        }),
        ...(req.query.endDate && { endDate: req.query.endDate as string }),
        ...(req.query.customerId && {
          customerId: parseInt(req.query.customerId as string),
        }),
        ...(req.query.status && { status: req.query.status as string }),
        ...(req.query.year && { year: parseInt(req.query.year as string) }),
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
   * Retourne les statistiques, l'année sélectionnée, les années disponibles et l'année par défaut
   */
  async getDashboardStatistics(req: Request, res: Response): Promise<void> {
    try {
      // Si une année est fournie, la valider et l'utiliser
      // Sinon, on utilisera l'année par défaut calculée par le service
      const yearParam = req.query.year
        ? parseInt(req.query.year as string)
        : undefined;

      if (yearParam !== undefined && (isNaN(yearParam) || yearParam < 2025)) {
        res.status(400).json({
          error: "Année invalide",
          message: "L'année doit être >= 2025",
        });
        return;
      }

      // Utiliser l'année fournie ou une année temporaire (sera remplacée par defaultYear)
      const year = yearParam || new Date().getFullYear();
      const dashboardData = await this.orderService.getDashboardStatistics(
        year
      );

      // Si aucune année n'était fournie, utiliser defaultYear comme année sélectionnée
      const finalYear =
        yearParam !== undefined ? year : dashboardData.defaultYear;

      res.json({
        success: true,
        data: {
          ...dashboardData,
          year: finalYear,
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
