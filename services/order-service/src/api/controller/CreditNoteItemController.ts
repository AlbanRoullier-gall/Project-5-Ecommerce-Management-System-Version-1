/**
 * Contrôleur des Articles d'Avoir
 * Gestion des requêtes HTTP pour les opérations d'articles d'avoir
 *
 * Architecture : Pattern Contrôleur
 * - Gestion des requêtes/réponses HTTP
 * - Orchestration des services
 * - Conversion des DTO
 */

import { Request, Response } from "express";
import OrderService from "../../services/OrderService";
import { CreditNoteItemCreateDTO } from "../dto";
import { OrderMapper, ResponseMapper } from "../mapper";

export class CreditNoteItemController {
  private orderService: OrderService;

  constructor(orderService: OrderService) {
    this.orderService = orderService;
  }

  /**
   * Créer un nouvel article d'avoir
   */
  async createCreditNoteItem(req: Request, res: Response): Promise<void> {
    try {
      const creditNoteItemCreateDTO: CreditNoteItemCreateDTO = req.body;

      // Convertir le DTO en CreditNoteItemData
      const creditNoteItemData =
        OrderMapper.creditNoteItemCreateDTOToCreditNoteItemData(
          creditNoteItemCreateDTO
        );

      const creditNoteItem = await this.orderService.createCreditNoteItem(
        creditNoteItemData
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
   * Obtenir un article d'avoir par son ID
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
   * Supprimer un article d'avoir
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
   * Obtenir les articles d'avoir par ID d'avoir
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
