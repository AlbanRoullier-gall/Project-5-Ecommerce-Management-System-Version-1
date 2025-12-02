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
import Joi from "joi";
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
      // Schéma de validation Joi pour les query params
      const orderStatisticsQuerySchema = Joi.object({
        year: Joi.number().integer().min(1900).max(2100).optional(),
        startDate: Joi.string().optional(),
        endDate: Joi.string().optional(),
        customerId: Joi.number().integer().positive().optional(),
        status: Joi.string().optional(),
      }).unknown(true);

      // Valider les query params
      const { error, value } = orderStatisticsQuerySchema.validate(req.query, {
        abortEarly: false,
        stripUnknown: true,
      });

      if (error) {
        const messages = error.details
          .map((detail) => detail.message)
          .join("; ");
        res
          .status(400)
          .json(
            ResponseMapper.validationError(
              `Paramètres de recherche invalides: ${messages}`
            )
          );
        return;
      }

      // Construire le DTO à partir des valeurs validées
      const searchParams: OrderStatisticsRequestDTO = {
        ...(value.year && { year: value.year }),
        ...(value.startDate && { startDate: value.startDate }),
        ...(value.endDate && { endDate: value.endDate }),
        ...(value.customerId && { customerId: value.customerId }),
        ...(value.status && { status: value.status }),
      };

      const yearParam = searchParams.year;

      // Utiliser l'année fournie ou une valeur temporaire (le service calculera defaultYear)
      // Le service accepte un number, mais on passera une valeur temporaire si undefined
      const tempYear = yearParam || new Date().getFullYear();
      const dashboardData = await this.orderService.getDashboardStatistics(
        tempYear
      );

      // Si aucune année n'était fournie, utiliser defaultYear comme année sélectionnée
      const finalYear =
        yearParam !== undefined ? yearParam : dashboardData.defaultYear;

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
