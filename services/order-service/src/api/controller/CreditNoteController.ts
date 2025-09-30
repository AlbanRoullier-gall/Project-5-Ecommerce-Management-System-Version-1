/**
 * CreditNote Controller
 * HTTP request handling for credit note operations
 *
 * Architecture : Controller pattern
 * - HTTP request/response handling
 * - Service orchestration
 * - DTO conversion
 */

import { Request, Response } from "express";
import OrderService from "../../services/OrderService";
import { CreditNoteCreateDTO, CreditNoteUpdateDTO } from "../dto/CreditNoteDTO";
import { CreditNoteData } from "../../models/CreditNote";
import { OrderMapper, ResponseMapper } from "../mapper";

export class CreditNoteController {
  private orderService: OrderService;

  constructor(orderService: OrderService) {
    this.orderService = orderService;
  }

  /**
   * Create a new credit note
   */
  async createCreditNote(req: Request, res: Response): Promise<void> {
    try {
      const creditNoteCreateDTO: CreditNoteCreateDTO = req.body;

      // Convert DTO to CreditNoteData
      const creditNoteData =
        OrderMapper.creditNoteCreateDTOToCreditNoteData(creditNoteCreateDTO);

      const creditNote = await this.orderService.createCreditNote(
        creditNoteData as CreditNoteData
      );
      const creditNoteDTO = OrderMapper.creditNoteToPublicDTO(creditNote);

      res.status(201).json(ResponseMapper.creditNoteCreated(creditNoteDTO));
    } catch (error: any) {
      console.error("Create credit note error:", error);
      if (error.message.includes("already exists")) {
        res.status(409).json(ResponseMapper.conflictError(error.message));
        return;
      }
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Get credit note by ID
   */
  async getCreditNoteById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const creditNote = await this.orderService.getCreditNoteById(
        parseInt(id!)
      );

      if (!creditNote) {
        res.status(404).json(ResponseMapper.notFoundError("Credit note"));
        return;
      }

      const creditNoteDTO = OrderMapper.creditNoteToPublicDTO(creditNote);
      res.json(ResponseMapper.creditNoteRetrieved(creditNoteDTO));
    } catch (error: any) {
      console.error("Get credit note error:", error);
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Update credit note
   */
  async updateCreditNote(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const creditNoteUpdateDTO: CreditNoteUpdateDTO = req.body;

      // Convert DTO to CreditNoteData
      const creditNoteData =
        OrderMapper.creditNoteUpdateDTOToCreditNoteData(creditNoteUpdateDTO);

      const creditNote = await this.orderService.updateCreditNote(
        parseInt(id!),
        creditNoteData
      );
      const creditNoteDTO = OrderMapper.creditNoteToPublicDTO(creditNote);

      res.json(ResponseMapper.creditNoteUpdated(creditNoteDTO));
    } catch (error: any) {
      console.error("Update credit note error:", error);
      if (error.message === "Credit note not found") {
        res.status(404).json(ResponseMapper.notFoundError("Credit note"));
        return;
      }
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Delete credit note
   */
  async deleteCreditNote(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const success = await this.orderService.deleteCreditNote(parseInt(id!));

      if (!success) {
        res.status(404).json(ResponseMapper.notFoundError("Credit note"));
        return;
      }

      res.json(ResponseMapper.creditNoteDeleted());
    } catch (error: any) {
      console.error("Delete credit note error:", error);
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Get credit notes by customer ID
   */
  async getCreditNotesByCustomerId(req: Request, res: Response): Promise<void> {
    try {
      const { customerId } = req.params;
      const creditNotes = await this.orderService.getCreditNotesByCustomerId(
        parseInt(customerId!)
      );

      const creditNoteDTOs = creditNotes.map((creditNote) =>
        OrderMapper.creditNoteToPublicDTO(creditNote)
      );

      res.json(
        ResponseMapper.success({
          creditNotes: creditNoteDTOs,
          count: creditNoteDTOs.length,
        })
      );
    } catch (error: any) {
      console.error("Get credit notes by customer ID error:", error);
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }
}
