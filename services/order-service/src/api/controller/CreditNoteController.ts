/**
 * Contrôleur des Avoirs
 * Gestion des requêtes HTTP pour les opérations d'avoirs
 *
 * Architecture : Pattern Contrôleur
 * - Gestion des requêtes/réponses HTTP
 * - Orchestration des services
 * - Conversion des DTO
 */

import { Request, Response } from "express";
import OrderService from "../../services/OrderService";
import { CreditNoteCreateDTO, CreditNoteListRequestDTO } from "../dto";
import { CreditNoteData } from "../../models/CreditNote";
import { OrderMapper, ResponseMapper } from "../mapper";

export class CreditNoteController {
  private orderService: OrderService;

  constructor(orderService: OrderService) {
    this.orderService = orderService;
  }

  /**
   * Créer un nouvel avoir
   */
  async createCreditNote(req: Request, res: Response): Promise<void> {
    try {
      const creditNoteCreateDTO: CreditNoteCreateDTO = req.body;

      // Convertir le DTO en CreditNoteData
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
   * Obtenir un avoir par son ID
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
   * Supprimer un avoir
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
   * Obtenir les avoirs par ID client
   */
  async getCreditNotesByCustomerId(req: Request, res: Response): Promise<void> {
    try {
      const customerId = req.params.customerId || req.query.customerId;
      if (!customerId) {
        res
          .status(400)
          .json(ResponseMapper.validationError("Customer ID is required"));
        return;
      }
      const creditNotes = await this.orderService.getCreditNotesByCustomerId(
        parseInt(customerId as string)
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

  /**
   * Lister tous les avoirs (admin)
   */
  async listCreditNotes(req: Request, res: Response): Promise<void> {
    try {
      const options: Partial<CreditNoteListRequestDTO> = {
        ...(req.query.page && { page: parseInt(req.query.page as string) }),
        ...(req.query.limit && { limit: parseInt(req.query.limit as string) }),
        ...(req.query.customerId && {
          customerId: parseInt(req.query.customerId as string),
        }),
        ...(req.query.year && { year: parseInt(req.query.year as string) }),
        ...(req.query.startDate && {
          startDate: req.query.startDate as string,
        }),
        ...(req.query.endDate && { endDate: req.query.endDate as string }),
      };

      const result = await this.orderService.listCreditNotes(options);
      res.json(ResponseMapper.success(result));
    } catch (error: any) {
      console.error("List credit notes error:", error);
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }
}
