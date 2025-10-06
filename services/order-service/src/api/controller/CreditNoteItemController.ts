/**
 * CreditNoteItem Controller
 * HTTP request handling for credit note item operations
 *
 * Architecture : Controller pattern
 * - HTTP request/response handling
 * - Service orchestration
 * - DTO conversion
 */

import { Request, Response } from "express";
import OrderService from "../../services/OrderService";
import { CreditNoteItemCreateDTO, CreditNoteItemUpdateDTO } from "../dto";
import { CreditNoteItemData } from "../../models/CreditNoteItem";
import { OrderMapper, ResponseMapper } from "../mapper";

export class CreditNoteItemController {
  private orderService: OrderService;

  constructor(orderService: OrderService) {
    this.orderService = orderService;
  }

  /**
   * Create a new credit note item
   */
  async createCreditNoteItem(req: Request, res: Response): Promise<void> {
    try {
      const creditNoteItemCreateDTO: CreditNoteItemCreateDTO = req.body;

      // Convert DTO to CreditNoteItemData
      const creditNoteItemData =
        OrderMapper.creditNoteItemCreateDTOToCreditNoteItemData(
          creditNoteItemCreateDTO
        );

      const creditNoteItem = await this.orderService.createCreditNoteItem(
        creditNoteItemData as CreditNoteItemData
      );
      const creditNoteItemDTO =
        OrderMapper.creditNoteItemToPublicDTO(creditNoteItem);

      res
        .status(201)
        .json(ResponseMapper.creditNoteItemCreated(creditNoteItemDTO));
    } catch (error: any) {
      console.error("Create credit note item error:", error);
      if (error.message.includes("already exists")) {
        res.status(409).json(ResponseMapper.conflictError(error.message));
        return;
      }
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Get credit note item by ID
   */
  async getCreditNoteItemById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const creditNoteItem = await this.orderService.getCreditNoteItemById(
        parseInt(id!)
      );

      if (!creditNoteItem) {
        res.status(404).json(ResponseMapper.notFoundError("Credit note item"));
        return;
      }

      const creditNoteItemDTO =
        OrderMapper.creditNoteItemToPublicDTO(creditNoteItem);
      res.json(ResponseMapper.creditNoteItemRetrieved(creditNoteItemDTO));
    } catch (error: any) {
      console.error("Get credit note item error:", error);
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Update credit note item
   */
  async updateCreditNoteItem(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const creditNoteItemUpdateDTO: CreditNoteItemUpdateDTO = req.body;

      // Convert DTO to CreditNoteItemData
      const creditNoteItemData =
        OrderMapper.creditNoteItemUpdateDTOToCreditNoteItemData(
          creditNoteItemUpdateDTO
        );

      const creditNoteItem = await this.orderService.updateCreditNoteItem(
        parseInt(id!),
        creditNoteItemData
      );
      const creditNoteItemDTO =
        OrderMapper.creditNoteItemToPublicDTO(creditNoteItem);

      res.json(ResponseMapper.creditNoteItemUpdated(creditNoteItemDTO));
    } catch (error: any) {
      console.error("Update credit note item error:", error);
      if (error.message === "Credit note item not found") {
        res.status(404).json(ResponseMapper.notFoundError("Credit note item"));
        return;
      }
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Delete credit note item
   */
  async deleteCreditNoteItem(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const success = await this.orderService.deleteCreditNoteItem(
        parseInt(id!)
      );

      if (!success) {
        res.status(404).json(ResponseMapper.notFoundError("Credit note item"));
        return;
      }

      res.json(ResponseMapper.creditNoteItemDeleted());
    } catch (error: any) {
      console.error("Delete credit note item error:", error);
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Get credit note items by credit note ID
   */
  async getCreditNoteItemsByCreditNoteId(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { creditNoteId } = req.params;
      const creditNoteItems =
        await this.orderService.getCreditNoteItemsByCreditNoteId(
          parseInt(creditNoteId!)
        );

      const creditNoteItemDTOs = creditNoteItems.map((creditNoteItem) =>
        OrderMapper.creditNoteItemToPublicDTO(creditNoteItem)
      );

      res.json(
        ResponseMapper.success({
          creditNoteItems: creditNoteItemDTOs,
          count: creditNoteItemDTOs.length,
        })
      );
    } catch (error: any) {
      console.error("Get credit note items by credit note ID error:", error);
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }
}
