/**
 * Contrôleur Produit
 * Points de terminaison de gestion des produits
 *
 * Architecture : Pattern Contrôleur
 * - Gestion des requêtes HTTP
 * - Orchestration des services
 * - Formatage des réponses
 */

import { Request, Response } from "express";
import ProductService from "../../services/ProductService";
import { ProductMapper, ResponseMapper } from "../mapper";
import { ProductCreateDTO, ProductUpdateDTO } from "../dto";

export class ProductController {
  private productService: ProductService;

  constructor(productService: ProductService) {
    this.productService = productService;
  }

  /**
   * Créer un produit
   */
  async createProduct(req: Request, res: Response): Promise<void> {
    try {
      const productData = ProductMapper.productCreateDTOToProductData(
        req.body as ProductCreateDTO
      );
      const product = await this.productService.createProduct(productData);
      res
        .status(201)
        .json(
          ResponseMapper.productCreated(
            ProductMapper.productToPublicDTO(product)
          )
        );
    } catch (error: any) {
      console.error("Erreur lors de la création du produit:", error);
      if (error.message === "Product with this name already exists") {
        res.status(409).json(ResponseMapper.conflictError(error.message));
        return;
      }
      if (error.message === "Category not found") {
        res.status(404).json(ResponseMapper.notFoundError("Category"));
        return;
      }
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Obtenir un produit par ID
   */
  async getProductById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const product = await this.productService.getProductById(parseInt(id));

      if (!product) {
        res.status(404).json(ResponseMapper.notFoundError("Product"));
        return;
      }

      // Obtenir les images du produit
      const images = await this.productService.listImages(parseInt(id));
      const productWithImages = {
        ...ProductMapper.productToPublicDTO(product),
        images: images.map((image) =>
          ProductMapper.productImageToPublicDTO(image)
        ),
      };

      res.json(ResponseMapper.productRetrieved(productWithImages));
    } catch (error: any) {
      console.error("Erreur lors de la récupération du produit:", error);
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Mettre à jour un produit
   */
  async updateProduct(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const productData = ProductMapper.productUpdateDTOToProductData(
        req.body as ProductUpdateDTO
      );
      const product = await this.productService.updateProduct(
        parseInt(id),
        productData
      );

      if (!product) {
        res.status(404).json(ResponseMapper.notFoundError("Product"));
        return;
      }

      res.json(
        ResponseMapper.productUpdated(ProductMapper.productToPublicDTO(product))
      );
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour du produit:", error);
      if (error.message === "Product not found") {
        res.status(404).json(ResponseMapper.notFoundError("Product"));
        return;
      }
      if (error.message === "Product name already exists") {
        res.status(409).json(ResponseMapper.conflictError(error.message));
        return;
      }
      if (error.message === "Category not found") {
        res.status(404).json(ResponseMapper.notFoundError("Category"));
        return;
      }
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Supprimer un produit
   */
  async deleteProduct(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const success = await this.productService.deleteProduct(parseInt(id));

      if (!success) {
        res.status(404).json(ResponseMapper.notFoundError("Product"));
        return;
      }

      res.json(ResponseMapper.productDeleted());
    } catch (error: any) {
      console.error("Erreur lors de la suppression du produit:", error);
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Lister les produits
   */
  async listProducts(req: Request, res: Response): Promise<void> {
    try {
      const options = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        ...(req.query.categoryId && {
          categoryId: parseInt(req.query.categoryId as string),
        }),
        search: req.query.search as string,
        activeOnly: req.query.activeOnly === "true",
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as "asc" | "desc",
      };

      const result = await this.productService.listProducts(options);

      // Ajouter les images à chaque produit
      if (result.products) {
        for (let product of result.products) {
          const images = await this.productService.listImages(product.id!);
          (product as any).images = images.map((image) =>
            ProductMapper.productImageToPublicDTO(image)
          );
        }
      }

      res.json(ResponseMapper.productListed(result));
    } catch (error: any) {
      console.error("Erreur lors de la liste des produits:", error);
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Activer un produit
   */
  async activateProduct(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const product = await this.productService.activateProduct(parseInt(id));

      if (!product) {
        res.status(404).json(ResponseMapper.notFoundError("Product"));
        return;
      }

      res.json(
        ResponseMapper.productUpdated(ProductMapper.productToPublicDTO(product))
      );
    } catch (error: any) {
      console.error("Erreur lors de l'activation du produit:", error);
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Désactiver un produit
   */
  async deactivateProduct(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const product = await this.productService.deactivateProduct(parseInt(id));

      if (!product) {
        res.status(404).json(ResponseMapper.notFoundError("Product"));
        return;
      }

      res.json(
        ResponseMapper.productUpdated(ProductMapper.productToPublicDTO(product))
      );
    } catch (error: any) {
      console.error("Erreur lors de la désactivation du produit:", error);
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }
}
