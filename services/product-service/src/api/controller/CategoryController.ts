/**
 * Contrôleur Catégorie
 * Points de terminaison de gestion des catégories
 *
 * Architecture : Pattern Contrôleur
 * - Gestion des requêtes HTTP
 * - Orchestration des services
 * - Formatage des réponses
 */

import { Request, Response } from "express";
import ProductService from "../../services/ProductService";
import { ProductMapper, ResponseMapper } from "../mapper";
import {
  CategoryCreateDTO,
  CategoryUpdateDTO,
  CategorySearchDTO,
} from "../dto";
const Joi = require("joi");

export class CategoryController {
  private productService: ProductService;

  constructor(productService: ProductService) {
    this.productService = productService;
  }

  /**
   * Créer une catégorie
   */
  async createCategory(req: Request, res: Response): Promise<void> {
    try {
      const categoryData = ProductMapper.categoryCreateDTOToCategoryData(
        req.body as CategoryCreateDTO
      );
      const category = await this.productService.createCategory(categoryData);
      res
        .status(201)
        .json(
          ResponseMapper.categoryCreated(
            ProductMapper.categoryToPublicDTO(category)
          )
        );
    } catch (error: any) {
      console.error("Erreur lors de la création de la catégorie:", error);
      if (error.message === "Category with this name already exists") {
        res.status(409).json(ResponseMapper.conflictError(error.message));
        return;
      }
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Obtenir une catégorie par ID
   */
  async getCategoryById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const category = await this.productService.getCategoryById(parseInt(id));

      if (!category) {
        res.status(404).json(ResponseMapper.notFoundError("Category"));
        return;
      }

      res.json(
        ResponseMapper.categoryRetrieved(
          ProductMapper.categoryToPublicDTO(category)
        )
      );
    } catch (error: any) {
      console.error("Erreur lors de la récupération de la catégorie:", error);
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Mettre à jour une catégorie
   */
  async updateCategory(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const categoryData = ProductMapper.categoryUpdateDTOToCategoryData(
        req.body as CategoryUpdateDTO
      );
      const category = await this.productService.updateCategory(
        parseInt(id),
        categoryData
      );

      if (!category) {
        res.status(404).json(ResponseMapper.notFoundError("Category"));
        return;
      }

      res.json(
        ResponseMapper.categoryUpdated(
          ProductMapper.categoryToPublicDTO(category)
        )
      );
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour de la catégorie:", error);
      if (error.message === "Category not found") {
        res.status(404).json(ResponseMapper.notFoundError("Category"));
        return;
      }
      if (error.message === "Category name already exists") {
        res.status(409).json(ResponseMapper.conflictError(error.message));
        return;
      }
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Supprimer une catégorie
   */
  async deleteCategory(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const success = await this.productService.deleteCategory(parseInt(id));

      if (!success) {
        res.status(404).json(ResponseMapper.notFoundError("Category"));
        return;
      }

      res.json(ResponseMapper.categoryDeleted());
    } catch (error: any) {
      console.error("Erreur lors de la suppression de la catégorie:", error);
      if (
        error.message.includes("supprimer cette catégorie") ||
        error.message.includes("existing products")
      ) {
        res
          .status(409)
          .json(
            ResponseMapper.conflictError(
              "Impossible de supprimer cette catégorie car elle contient des produits"
            )
          );
        return;
      }
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Lister les catégories
   * Supporte CategorySearchDTO pour la recherche et pagination
   */
  async listCategories(req: Request, res: Response): Promise<void> {
    try {
      // Schéma de validation Joi pour les query params
      const categorySearchQuerySchema = Joi.object({
        search: Joi.string().max(255).optional().allow(""),
        sortBy: Joi.string()
          .valid("name", "createdAt", "created_at")
          .optional(),
        sortOrder: Joi.string().valid("asc", "desc").optional(),
      }).unknown(true);

      // Valider les query params
      const { error, value } = categorySearchQuerySchema.validate(req.query, {
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
      const searchParams: CategorySearchDTO = {
        ...(value.search && { search: value.search }),
        ...(value.sortBy && {
          sortBy: value.sortBy as "name" | "createdAt" | "created_at",
        }),
        ...(value.sortOrder && {
          sortOrder: value.sortOrder as "asc" | "desc",
        }),
      };

      // Vérifier si des paramètres de recherche sont présents
      const hasSearchParams =
        searchParams.search || searchParams.sortBy || searchParams.sortOrder;

      if (hasSearchParams) {
        // Utiliser la recherche
        const sortByMapping: Record<string, string> = {
          name: "name",
          createdAt: "createdAt",
          created_at: "createdAt",
        };

        const sortByParam = searchParams.sortBy || "name";
        const sortBy = sortByMapping[sortByParam] || sortByParam;

        // Utiliser le DTO validé avec valeurs par défaut
        const searchDTO: CategorySearchDTO = {
          ...searchParams,
          sortBy: sortBy as "name" | "createdAt",
        };

        const searchOptions = {
          ...(searchDTO.search && { search: searchDTO.search }),
          ...(searchDTO.sortBy && { sortBy: searchDTO.sortBy }),
          sortOrder: searchDTO.sortOrder || "asc",
        };

        const categories = await this.productService.listCategoriesWithSearch(
          searchOptions
        );

        const categoriesDTO = categories.map((category) =>
          ProductMapper.categoryToPublicDTO(category)
        );

        // Format standardisé : même format que productListed
        res.json(
          ResponseMapper.categoryListed({
            categories: categoriesDTO,
          })
        );
      } else {
        // Comportement par défaut : retourner toutes les catégories
        const categories = await this.productService.listCategories();
        const categoriesDTO = categories.map((category: any) =>
          ProductMapper.categoryToPublicDTO(category)
        );
        // Format standardisé : même format que productListed
        res.json(
          ResponseMapper.categoryListed({
            categories: categoriesDTO,
          })
        );
      }
    } catch (error: any) {
      console.error("Erreur lors de la liste des catégories:", error);
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Valider les données catégorie (sans les créer)
   * Retourne les erreurs structurées par champ
   */
  async validateCategoryData(req: Request, res: Response): Promise<void> {
    try {
      const categoryData: CategoryCreateDTO | CategoryUpdateDTO = req.body;

      const validationResult =
        this.productService.validateCategoryData(categoryData);

      if (!validationResult.isValid) {
        res.status(400).json({
          success: false,
          isValid: false,
          errors: validationResult.errors,
          timestamp: new Date().toISOString(),
          status: 400,
        });
        return;
      }

      res.json({
        success: true,
        isValid: true,
        message: "Les données catégorie sont valides",
        timestamp: new Date().toISOString(),
        status: 200,
      });
    } catch (error: any) {
      console.error("Validate category data error:", error);
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }
}
