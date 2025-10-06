/**
 * OrderStatistics Controller
 * HTTP request handling for order statistics operations
 *
 * Architecture : Controller pattern
 * - HTTP request/response handling
 * - Service orchestration
 * - DTO conversion
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
   * Get order statistics
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
      };

      const statistics = await this.orderService.getOrderStatistics(options);

      res.json(ResponseMapper.orderStatisticsRetrieved(statistics));
    } catch (error: any) {
      console.error("Get order statistics error:", error);
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Get order statistics by customer
   */
  async getOrderStatisticsByCustomer(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { customerId } = req.params;
      const options: OrderStatisticsRequestDTO = {
        customerId: parseInt(customerId),
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
        status: req.query.status as string,
      };

      const statistics = await this.orderService.getOrderStatistics(options);

      res.json(ResponseMapper.orderStatisticsRetrieved(statistics));
    } catch (error: any) {
      console.error("Get order statistics by customer error:", error);
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Get order statistics by date range
   */
  async getOrderStatisticsByDateRange(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { startDate, endDate } = req.params;
      const options: OrderStatisticsRequestDTO = {
        startDate,
        endDate,
        customerId: req.query.customerId
          ? parseInt(req.query.customerId as string)
          : undefined,
        status: req.query.status as string,
      };

      const statistics = await this.orderService.getOrderStatistics(options);

      res.json(ResponseMapper.orderStatisticsRetrieved(statistics));
    } catch (error: any) {
      console.error("Get order statistics by date range error:", error);
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }
}
