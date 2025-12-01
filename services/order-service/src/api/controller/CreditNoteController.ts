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
   * Parse et valide les query params côté serveur
   */
  async listCreditNotes(req: Request, res: Response): Promise<void> {
    try {
      const options: Partial<CreditNoteListRequestDTO> = {};

      // Parser et valider page
      if (req.query.page) {
        const page = parseInt(req.query.page as string);
        if (isNaN(page) || page < 1) {
          res
            .status(400)
            .json(ResponseMapper.badRequestError("Invalid page parameter"));
          return;
        }
        options.page = page;
      }

      // Parser et valider limit
      if (req.query.limit) {
        const limit = parseInt(req.query.limit as string);
        if (isNaN(limit) || limit < 1) {
          res
            .status(400)
            .json(ResponseMapper.badRequestError("Invalid limit parameter"));
          return;
        }
        options.limit = limit;
      }

      // Parser et valider customerId
      if (req.query.customerId) {
        const customerId = parseInt(req.query.customerId as string);
        if (isNaN(customerId) || customerId < 1) {
          res
            .status(400)
            .json(
              ResponseMapper.badRequestError("Invalid customerId parameter")
            );
          return;
        }
        options.customerId = customerId;
      }

      // Parser et valider year
      if (req.query.year && req.query.year !== "") {
        const year = parseInt(req.query.year as string);
        if (isNaN(year) || year < 1900 || year > 2100) {
          res
            .status(400)
            .json(ResponseMapper.badRequestError("Invalid year parameter"));
          return;
        }
        options.year = year;
      }

      // Parser et valider startDate (string)
      if (req.query.startDate && req.query.startDate !== "") {
        options.startDate = req.query.startDate as string;
      }

      // Parser et valider endDate (string)
      if (req.query.endDate && req.query.endDate !== "") {
        options.endDate = req.query.endDate as string;
      }

      const result = await this.orderService.listCreditNotes(options);
      // Format standardisé : { data: { creditNotes: [], pagination: {} }, ... }
      res.json(
        ResponseMapper.success(
          {
            creditNotes: result.creditNotes || [],
            pagination: result.pagination || {
              page: 1,
              limit: 10,
              total: 0,
              pages: 0,
              hasMore: false,
            },
          },
          "Liste des avoirs récupérée avec succès"
        )
      );
    } catch (error: any) {
      console.error("List credit notes error:", error);
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Calculer les totaux HT et TTC à partir d'une liste d'IDs d'items
   * Récupère les items depuis la base de données et calcule les totaux
   * Utilise la logique métier du modèle CreditNote pour garantir la cohérence
   */
  async calculateTotals(req: Request, res: Response): Promise<void> {
    try {
      const { itemIds } = req.body;

      // Valider que itemIds est un tableau
      if (!itemIds || !Array.isArray(itemIds)) {
        res
          .status(400)
          .json(
            ResponseMapper.validationError(
              "itemIds array is required and must be an array"
            )
          );
        return;
      }

      // Valider que tous les IDs sont des nombres valides
      const validItemIds = itemIds
        .map((id) => parseInt(String(id)))
        .filter((id) => !isNaN(id) && id > 0);

      if (validItemIds.length === 0) {
        res
          .status(400)
          .json(
            ResponseMapper.validationError(
              "At least one valid item ID is required"
            )
          );
        return;
      }

      // Récupérer les items depuis la base de données
      const orderItems = await this.orderService.getOrderItemsByIds(
        validItemIds
      );

      if (orderItems.length === 0) {
        res
          .status(404)
          .json(
            ResponseMapper.validationError(
              "No order items found for the provided IDs"
            )
          );
        return;
      }

      // Vérifier que tous les IDs ont été trouvés
      if (orderItems.length !== validItemIds.length) {
        res
          .status(400)
          .json(
            ResponseMapper.validationError(
              "Some item IDs were not found in the database"
            )
          );
        return;
      }

      // Préparer les items pour le calcul (utiliser les prix depuis la base)
      const itemsForCalculation = orderItems.map((item) => ({
        totalPriceHT: item.totalPriceHT,
        totalPriceTTC: item.totalPriceTTC,
      }));

      // Utiliser la méthode statique du modèle CreditNote pour calculer les totaux
      const totals = CreditNote.calculateTotalsFromItems(itemsForCalculation);

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
