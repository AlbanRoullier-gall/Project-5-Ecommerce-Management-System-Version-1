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
import {
  ProductCreateDTO,
  ProductUpdateDTO,
  ProductListRequestDTO,
} from "../dto";

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
      // Mapper les noms de colonnes camelCase vers snake_case pour la base de données
      const sortByMapping: Record<string, string> = {
        name: "name",
        price: "price",
        createdAt: "created_at",
        created_at: "created_at",
      };

      const sortByParam = (req.query.sortBy as string) || "created_at";
      const sortBy = sortByMapping[sortByParam] || sortByParam;

      // Parser les catégories multiples si présentes
      let categories: number[] | undefined;
      if (req.query.categories) {
        const categoriesParam = req.query.categories as string;
        categories = categoriesParam
          .split(",")
          .map((id) => parseInt(id.trim()))
          .filter((id) => !isNaN(id));
      }

      // Construire le DTO de requête
      const listRequestDTO: ProductListRequestDTO = {
        ...(req.query.page && { page: parseInt(req.query.page as string) }),
        ...(req.query.limit && { limit: parseInt(req.query.limit as string) }),
        ...(req.query.search && { search: req.query.search as string }),
        ...(req.query.categoryId && {
          categoryId: parseInt(req.query.categoryId as string),
        }),
        ...(categories && categories.length > 0 && { categories }),
        ...(req.query.activeOnly !== undefined && {
          activeOnly: String(req.query.activeOnly) === "true",
        }),
        ...(req.query.minPrice && {
          minPrice: parseFloat(req.query.minPrice as string),
        }),
        ...(req.query.maxPrice && {
          maxPrice: parseFloat(req.query.maxPrice as string),
        }),
        sortBy: sortBy as "name" | "price" | "createdAt" | "created_at",
        ...(req.query.sortOrder && {
          sortOrder: req.query.sortOrder as "asc" | "desc",
        }),
      };

      const options = {
        page: listRequestDTO.page || 1,
        limit: listRequestDTO.limit || 10,
        ...(listRequestDTO.categoryId && {
          categoryId: listRequestDTO.categoryId,
        }),
        ...(listRequestDTO.categories && {
          categories: listRequestDTO.categories,
        }),
        ...(listRequestDTO.search && { search: listRequestDTO.search }),
        ...(listRequestDTO.activeOnly !== undefined && {
          activeOnly: listRequestDTO.activeOnly,
        }),
        ...(listRequestDTO.minPrice && { minPrice: listRequestDTO.minPrice }),
        ...(listRequestDTO.maxPrice && { maxPrice: listRequestDTO.maxPrice }),
        sortBy: sortBy,
        sortOrder: listRequestDTO.sortOrder || "asc",
      };

      const result = await this.productService.listProducts(options);

      // Mapper les produits vers ProductPublicDTO et ajouter les images
      if (result.products) {
        const mappedProducts = await Promise.all(
          result.products.map(async (product) => {
            // Mapper le produit vers DTO (inclut maintenant priceTTC)
            const productDTO = ProductMapper.productToPublicDTO(product);
            // Ajouter les images
            try {
              const images = await this.productService.listImages(product.id!);
              productDTO.images = images.map((image) =>
                ProductMapper.productImageToPublicDTO(image)
              );
            } catch (imageError) {
              console.error(
                `Erreur lors du chargement des images pour le produit ${product.id}:`,
                imageError
              );
              productDTO.images = [];
            }
            return productDTO;
          })
        );

        res.json(
          ResponseMapper.productListed({
            ...result,
            products: mappedProducts,
          })
        );
      } else {
        res.json(ResponseMapper.productListed(result));
      }
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

  /**
   * Obtenir les statistiques formatées pour le dashboard
   */
  async getDashboardStatistics(req: Request, res: Response): Promise<void> {
    try {
      const year = req.query.year
        ? parseInt(req.query.year as string)
        : new Date().getFullYear();

      if (isNaN(year) || year < 2025) {
        res.status(400).json({
          error: "Année invalide",
          message: "L'année doit être >= 2025",
        });
        return;
      }

      const statistics = await this.productService.getDashboardStatistics(year);

      res.json({
        success: true,
        data: {
          statistics,
          year,
        },
        timestamp: new Date().toISOString(),
        status: 200,
      });
    } catch (error: any) {
      console.error("Get dashboard statistics error:", error);
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }
}
