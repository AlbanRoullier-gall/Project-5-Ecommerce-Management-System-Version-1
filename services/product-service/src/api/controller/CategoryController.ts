/**
 * Category Controller
 * Category management endpoints
 *
 * Architecture : Controller pattern
 * - HTTP request handling
 * - Service orchestration
 * - Response formatting
 */

import { Request, Response } from "express";
import ProductService from "../../services/ProductService";
import { ProductMapper, ResponseMapper } from "../mapper";
import { CategoryCreateDTO, CategoryUpdateDTO } from "../dto";

export class CategoryController {
  private productService: ProductService;

  constructor(productService: ProductService) {
    this.productService = productService;
  }

  /**
   * Create category
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
      console.error("Create category error:", error);
      if (error.message === "Category with this name already exists") {
        res.status(409).json(ResponseMapper.conflictError(error.message));
        return;
      }
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Get category by ID
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
      console.error("Get category error:", error);
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Update category
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
      console.error("Update category error:", error);
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
   * Delete category
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
      console.error("Delete category error:", error);
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
   * List categories
   */
  async listCategories(req: Request, res: Response): Promise<void> {
    try {
      const categories = await this.productService.listCategories();
      const categoriesDTO = categories.map((category) =>
        ProductMapper.categoryToPublicDTO(category)
      );
      res.json(ResponseMapper.categoryListed(categoriesDTO));
    } catch (error: any) {
      console.error("List categories error:", error);
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }
}
