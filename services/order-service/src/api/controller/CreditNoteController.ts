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
import { OrderMapper, ResponseMapper } from "../mapper";
import CreditNote from "../../models/CreditNote";

export class CreditNoteController {
  private orderService: OrderService;

  constructor(orderService: OrderService) {
    this.orderService = orderService;
  }

  /**
   * Créer un nouvel avoir
   * Si items est fourni, les totaux sont calculés automatiquement et tout est créé en transaction
   * Si items n'est pas fourni, les totaux doivent être fournis (comportement classique)
   */
  async createCreditNote(req: Request, res: Response): Promise<void> {
    try {
      const creditNoteCreateDTO: CreditNoteCreateDTO = req.body;

      // Valider que soit items soit les totaux sont fournis
      if (
        (!creditNoteCreateDTO.items ||
          creditNoteCreateDTO.items.length === 0) &&
        (!creditNoteCreateDTO.totalAmountHT ||
          !creditNoteCreateDTO.totalAmountTTC)
      ) {
        res
          .status(400)
          .json(
            ResponseMapper.validationError(
              "Either items or totalAmountHT/totalAmountTTC must be provided"
            )
          );
        return;
      }

      // Utiliser le mapper pour convertir DTO → CreditNoteData (avec calcul des totaux si items présent)
      const creditNoteData =
        OrderMapper.creditNoteCreateDTOToCreditNoteData(creditNoteCreateDTO);

      // Extraire les items du DTO pour les passer séparément au service
      const items = creditNoteCreateDTO.items;

      // Passer les modèles au service (pas le DTO)
      const creditNote = await this.orderService.createCreditNote(
        creditNoteData,
        items
      );
      const creditNoteDTO = OrderMapper.creditNoteToPublicDTO(creditNote);

      res.status(201).json(ResponseMapper.creditNoteCreated(creditNoteDTO));
    } catch (error: any) {
      console.error("Create credit note error:", error);
      if (error.message.includes("already exists")) {
        res.status(409).json(ResponseMapper.conflictError(error.message));
        return;
      }
      const statusCode =
        error.message.includes("required") ||
        error.message.includes("must be provided")
          ? 400
          : 500;
      res
        .status(statusCode)
        .json(
          ResponseMapper.error(
            error.message || "Erreur lors de la création de l'avoir"
          )
        );
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

  /**
   * Calculer les totaux HT et TTC à partir d'une liste d'items
   * Utilise la logique métier du modèle CreditNote pour garantir la cohérence
   */
  async calculateTotals(req: Request, res: Response): Promise<void> {
    try {
      const { items } = req.body;

      if (!items || !Array.isArray(items)) {
        res
          .status(400)
          .json(
            ResponseMapper.validationError(
              "Items array is required and must be an array"
            )
          );
        return;
      }

      // Valider que chaque item a les propriétés nécessaires
      for (const item of items) {
        if (
          typeof item.totalPriceHT === "undefined" ||
          typeof item.totalPriceTTC === "undefined"
        ) {
          res
            .status(400)
            .json(
              ResponseMapper.validationError(
                "Each item must have totalPriceHT and totalPriceTTC properties"
              )
            );
          return;
        }
      }

      // Utiliser la méthode statique du modèle CreditNote pour calculer les totaux
      const totals = CreditNote.calculateTotalsFromItems(items);

      res.json(
        ResponseMapper.success({
          totalHT: totals.totalHT,
          totalTTC: totals.totalTTC,
          totalVAT: totals.totalTTC - totals.totalHT,
        })
      );
    } catch (error: any) {
      console.error("Calculate totals error:", error);
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }
}
