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
      // Vérifier si des paramètres de recherche sont présents (CategorySearchDTO)
      const hasSearchParams =
        req.query.page ||
        req.query.limit ||
        req.query.search ||
        req.query.sortBy ||
        req.query.sortOrder;

      if (hasSearchParams) {
        // Utiliser la recherche avec pagination
        const sortByMapping: Record<string, string> = {
          name: "name",
          createdAt: "createdAt",
          created_at: "createdAt",
        };

        const sortByParam = (req.query.sortBy as string) || "name";
        const sortBy = sortByMapping[sortByParam] || sortByParam;

        // Construire le DTO de recherche
        const searchDTO: CategorySearchDTO = {
          ...(req.query.page && { page: parseInt(req.query.page as string) }),
          ...(req.query.limit && {
            limit: parseInt(req.query.limit as string),
          }),
          ...(req.query.search && { search: req.query.search as string }),
          sortBy: sortBy as "name" | "createdAt",
          ...(req.query.sortOrder && {
            sortOrder: req.query.sortOrder as "asc" | "desc",
          }),
        };

        const searchOptions = {
          ...(searchDTO.page && { page: searchDTO.page }),
          ...(searchDTO.limit && { limit: searchDTO.limit }),
          ...(searchDTO.search && { search: searchDTO.search }),
          ...(searchDTO.sortBy && { sortBy: searchDTO.sortBy }),
          ...(searchDTO.sortOrder && { sortOrder: searchDTO.sortOrder }),
        };

        const result = await this.productService.listCategoriesWithSearch(
          searchOptions
        );

        const categoriesDTO = result.categories.map((category) =>
          ProductMapper.categoryToPublicDTO(category)
        );

        res.json(
          ResponseMapper.categoryListedWithPagination(
            categoriesDTO,
            result.pagination
          )
        );
      } else {
        // Comportement par défaut : retourner toutes les catégories
        const categories = await this.productService.listCategories();
        const categoriesDTO = categories.map((category) =>
          ProductMapper.categoryToPublicDTO(category)
        );
        res.json(ResponseMapper.categoryListed(categoriesDTO));
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
