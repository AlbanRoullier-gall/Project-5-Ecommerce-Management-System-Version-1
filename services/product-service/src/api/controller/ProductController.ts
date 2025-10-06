/**
 * Product Controller
 * Product management endpoints
 *
 * Architecture : Controller pattern
 * - HTTP request handling
 * - Service orchestration
 * - Response formatting
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
   * Create product
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
      console.error("Create product error:", error);
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
   * Get product by ID
   */
  async getProductById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const product = await this.productService.getProductById(parseInt(id));

      if (!product) {
        res.status(404).json(ResponseMapper.notFoundError("Product"));
        return;
      }

      // Get product images
      const images = await this.productService.listImages(parseInt(id));
      const productWithImages = {
        ...ProductMapper.productToPublicDTO(product),
        images: images.map((image) =>
          ProductMapper.productImageToPublicDTO(image)
        ),
      };

      res.json(ResponseMapper.productRetrieved(productWithImages));
    } catch (error: any) {
      console.error("Get product error:", error);
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Update product
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
      console.error("Update product error:", error);
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
   * Delete product
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
      console.error("Delete product error:", error);
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * List products
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

      // Add images to each product
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
      console.error("List products error:", error);
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Toggle product status
   */
  async toggleProductStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const product = await this.productService.toggleProductStatus(
        parseInt(id)
      );

      if (!product) {
        res.status(404).json(ResponseMapper.notFoundError("Product"));
        return;
      }

      res.json(
        ResponseMapper.productUpdated(ProductMapper.productToPublicDTO(product))
      );
    } catch (error: any) {
      console.error("Toggle product status error:", error);
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Activate product
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
      console.error("Activate product error:", error);
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Deactivate product
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
      console.error("Deactivate product error:", error);
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }
}
