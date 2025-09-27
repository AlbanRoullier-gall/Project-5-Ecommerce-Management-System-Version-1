/**
 * ProductService
 * Business logic layer for product management
 */
import { Pool } from "pg";
import Category from "../models/Category";
import Product from "../models/Product";
import ProductImage from "../models/ProductImage";
import CategoryRepository from "../repositories/CategoryRepository";
import ProductRepository from "../repositories/ProductRepository";
import ProductImageRepository from "../repositories/ProductImageRepository";
import {
  ProductData,
  CategoryData,
  ProductListOptions,
  ProductListResult,
} from "../types";

export default class ProductService {
  private categoryRepository: CategoryRepository;
  private productRepository: ProductRepository;
  private imageRepository: ProductImageRepository;

  constructor(pool: Pool) {
    this.categoryRepository = new CategoryRepository(pool);
    this.productRepository = new ProductRepository(pool);
    this.imageRepository = new ProductImageRepository(pool);
  }

  // Category management methods

  /**
   * Create a new category
   * @param {Object} data Category data
   * @returns {Promise<Category>} Created category
   */
  async createCategory(data: CategoryData): Promise<Category> {
    try {
      // Check if category name already exists
      const nameExists = await this.categoryRepository.nameExists(data.name);
      if (nameExists) {
        throw new Error("Category with this name already exists");
      }

      // Create category entity
      const category = new Category(data);

      // Save category
      return await this.categoryRepository.save(category);
    } catch (error) {
      console.error("Error creating category:", error);
      throw error;
    }
  }

  /**
   * Update category
   * @param {number} id Category ID
   * @param {Object} data Update data
   * @returns {Promise<Category>} Updated category
   */
  async updateCategory(id: number, data: CategoryData): Promise<Category> {
    try {
      const category = await this.categoryRepository.getById(id);
      if (!category) {
        throw new Error("Category not found");
      }

      // Check if name is being updated and if it conflicts
      if (data.name && data.name !== category.name) {
        const nameExists = await this.categoryRepository.nameExists(
          data.name,
          id
        );
        if (nameExists) {
          throw new Error("Category name already exists");
        }
      }

      // Update category entity
      Object.assign(category, data);
      category.id = id; // Ensure ID is preserved

      return await this.categoryRepository.update(category);
    } catch (error) {
      console.error("Error updating category:", error);
      throw error;
    }
  }

  /**
   * Delete category
   * @param {number} id Category ID
   * @returns {Promise<boolean>} True if deleted successfully
   */
  async deleteCategory(id: number): Promise<boolean> {
    try {
      const category = await this.categoryRepository.getById(id);
      if (!category) {
        throw new Error("Category not found");
      }

      // Check if category has products
      const productCount = await this.categoryRepository.countProducts(id);
      if (productCount > 0) {
        throw new Error("Cannot delete category with existing products");
      }

      return await this.categoryRepository.delete(category);
    } catch (error) {
      console.error("Error deleting category:", error);
      throw error;
    }
  }

  /**
   * Get category by ID
   * @param {number} id Category ID
   * @returns {Promise<Category|null>} Category or null if not found
   */
  async getCategoryById(id: number): Promise<Category | null> {
    try {
      return await this.categoryRepository.getById(id);
    } catch (error) {
      console.error("Error getting category by ID:", error);
      throw error;
    }
  }

  /**
   * List all categories
   * @returns {Promise<Category[]>} Array of categories
   */
  async listCategories(): Promise<Category[]> {
    try {
      return await this.categoryRepository.listAll();
    } catch (error) {
      console.error("Error listing categories:", error);
      throw error;
    }
  }

  // Product management methods

  /**
   * Create a new product
   * @param {Object} data Product data
   * @returns {Promise<Product>} Created product
   */
  async createProduct(data: ProductData): Promise<Product> {
    try {
      // Check if product name already exists
      const nameExists = await this.productRepository.nameExists(data.name);
      if (nameExists) {
        throw new Error("Product with this name already exists");
      }

      // Verify category exists
      const category = await this.categoryRepository.getById(data.categoryId);
      if (!category) {
        throw new Error("Category not found");
      }

      // Create product entity
      const product = new Product(data);

      // Save product
      return await this.productRepository.save(product);
    } catch (error) {
      console.error("Error creating product:", error);
      throw error;
    }
  }

  /**
   * Update product
   * @param {number} id Product ID
   * @param {Object} data Update data
   * @returns {Promise<Product>} Updated product
   */
  async updateProduct(id: number, data: ProductData): Promise<Product> {
    try {
      const product = await this.productRepository.getById(id);
      if (!product) {
        throw new Error("Product not found");
      }

      // Check if name is being updated and if it conflicts
      if (data.name && data.name !== product.name) {
        const nameExists = await this.productRepository.nameExists(
          data.name,
          id
        );
        if (nameExists) {
          throw new Error("Product name already exists");
        }
      }

      // Verify category exists if being updated
      if (data.categoryId && data.categoryId !== product.categoryId) {
        const category = await this.categoryRepository.getById(data.categoryId);
        if (!category) {
          throw new Error("Category not found");
        }
      }

      // Update product entity
      Object.assign(product, data);
      product.id = id; // Ensure ID is preserved

      return await this.productRepository.update(product);
    } catch (error) {
      console.error("Error updating product:", error);
      throw error;
    }
  }

  /**
   * Delete product
   * @param {number} id Product ID
   * @returns {Promise<boolean>} True if deleted successfully
   */
  async deleteProduct(id: number): Promise<boolean> {
    try {
      const product = await this.productRepository.getById(id);
      if (!product) {
        throw new Error("Product not found");
      }

      // Delete all images first
      const images = await this.imageRepository.listByProduct(id);
      for (const image of images) {
        await this.imageRepository.delete(image);
      }

      return await this.productRepository.delete(product);
    } catch (error) {
      console.error("Error deleting product:", error);
      throw error;
    }
  }

  /**
   * Get product by ID
   * @param {number} id Product ID
   * @returns {Promise<Product|null>} Product or null if not found
   */
  async getProductById(id: number): Promise<Product | null> {
    try {
      return await this.productRepository.getByIdWithJoins(id);
    } catch (error) {
      console.error("Error getting product by ID:", error);
      throw error;
    }
  }

  /**
   * List products with pagination and search
   * @param {Object} options List options
   * @returns {Promise<Object>} Products and pagination info
   */
  async listProducts(
    options: ProductListOptions = {}
  ): Promise<ProductListResult> {
    try {
      return await this.productRepository.listAll(options);
    } catch (error) {
      console.error("Error listing products:", error);
      throw error;
    }
  }

  /**
   * Toggle product status (active/inactive)
   * @param {number} id Product ID
   * @returns {Promise<Product>} Updated product
   */
  async toggleProductStatus(id: number): Promise<Product> {
    try {
      const product = await this.productRepository.getById(id);
      if (!product) {
        throw new Error("Product not found");
      }

      // Toggle status
      product.isActive = !product.isActive;

      return await this.productRepository.update(product);
    } catch (error) {
      console.error("Error toggling product status:", error);
      throw error;
    }
  }

  /**
   * Activate product
   * @param {number} id Product ID
   * @returns {Promise<boolean>} True if activated successfully
   */
  async activateProduct(id: number): Promise<boolean> {
    try {
      return await this.productRepository.activate(id);
    } catch (error) {
      console.error("Error activating product:", error);
      throw error;
    }
  }

  /**
   * Deactivate product
   * @param {number} id Product ID
   * @returns {Promise<boolean>} True if deactivated successfully
   */
  async deactivateProduct(id: number): Promise<boolean> {
    try {
      return await this.productRepository.deactivate(id);
    } catch (error) {
      console.error("Error deactivating product:", error);
      throw error;
    }
  }

  // Image management methods

  /**
   * List images for a product
   * @param {number} productId Product ID
   * @returns {Promise<ProductImage[]>} Array of images
   */
  async listImages(productId: number): Promise<ProductImage[]> {
    try {
      return await this.imageRepository.listByProduct(productId);
    } catch (error) {
      console.error("Error listing images:", error);
      throw error;
    }
  }

  /**
   * Get image by ID
   * @param {number} id Image ID
   * @returns {Promise<ProductImage|null>} Image or null if not found
   */
  async getImageById(id: number): Promise<ProductImage | null> {
    try {
      return await this.imageRepository.getById(id);
    } catch (error) {
      console.error("Error getting image by ID:", error);
      throw error;
    }
  }

  /**
   * Add image to product
   * @param {number} productId Product ID
   * @param {Object} imageData Image data
   * @returns {Promise<ProductImage>} Created image
   */
  async addImage(productId: number, imageData: any): Promise<ProductImage> {
    try {
      // Verify product exists
      const product = await this.productRepository.getById(productId);
      if (!product) {
        throw new Error("Product not found");
      }

      // Get next order index
      const orderIndex = await this.imageRepository.getNextOrderIndex(
        productId
      );

      // Create image entity
      const image = new ProductImage({
        ...imageData,
        productId,
        orderIndex,
      });

      return await this.imageRepository.save(image);
    } catch (error) {
      console.error("Error adding image:", error);
      throw error;
    }
  }

  /**
   * Update image
   * @param {number} id Image ID
   * @param {Object} data Update data
   * @returns {Promise<ProductImage>} Updated image
   */
  async updateImage(id: number, data: any): Promise<ProductImage> {
    try {
      const image = await this.imageRepository.getById(id);
      if (!image) {
        throw new Error("Image not found");
      }

      // Update image entity
      Object.assign(image, data);

      return await this.imageRepository.update(image);
    } catch (error) {
      console.error("Error updating image:", error);
      throw error;
    }
  }

  /**
   * Delete image
   * @param {number} id Image ID
   * @returns {Promise<boolean>} True if deleted successfully
   */
  async deleteImage(id: number): Promise<boolean> {
    try {
      const image = await this.imageRepository.getById(id);
      if (!image) {
        throw new Error("Image not found");
      }

      return await this.imageRepository.delete(image);
    } catch (error) {
      console.error("Error deleting image:", error);
      throw error;
    }
  }

  /**
   * Reorder images for a product
   * @param {number} productId Product ID
   * @param {number[]} imageIds Array of image IDs in new order
   * @returns {Promise<boolean>} True if reordered successfully
   */
  async reorderImages(productId: number, imageIds: number[]): Promise<boolean> {
    try {
      // Verify all images belong to the product
      const images = await this.imageRepository.listByProduct(productId);
      const productImageIds = images.map((img) => img.id);

      for (const imageId of imageIds) {
        if (!productImageIds.includes(imageId)) {
          throw new Error("Image does not belong to this product");
        }
      }

      // Update order for each image
      for (let i = 0; i < imageIds.length; i++) {
        await this.imageRepository.updateOrder(imageIds[i], i);
      }

      return true;
    } catch (error) {
      console.error("Error reordering images:", error);
      throw error;
    }
  }

  /**
   * Create a new product image
   * @param {Object} data Image data
   * @returns {Promise<ProductImage>} Created image
   */
  async createImage(data: any): Promise<ProductImage> {
    try {
      const image = new ProductImage(data);
      const createdImage = await this.imageRepository.create(image);
      return createdImage;
    } catch (error) {
      console.error("Error creating image:", error);
      throw error;
    }
  }

  /**
   * Update a product
   * @param {number} id Product ID
   * @param {Object} data Product data
   * @returns {Promise<Product>} Updated product
   */
  async updateProduct(id: number, data: any): Promise<Product> {
    try {
      const product = await this.productRepository.update(id, data);
      return product;
    } catch (error) {
      console.error("Error updating product:", error);
      throw error;
    }
  }

  /**
   * Delete a product
   * @param {number} id Product ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteProduct(id: number): Promise<boolean> {
    try {
      const success = await this.productRepository.delete(id);
      return success;
    } catch (error) {
      console.error("Error deleting product:", error);
      throw error;
    }
  }

  /**
   * Activate a product
   * @param {number} id Product ID
   * @returns {Promise<Product>} Activated product
   */
  async activateProduct(id: number): Promise<Product> {
    try {
      const product = await this.productRepository.activate(id);
      return product;
    } catch (error) {
      console.error("Error activating product:", error);
      throw error;
    }
  }

  /**
   * Deactivate a product
   * @param {number} id Product ID
   * @returns {Promise<Product>} Deactivated product
   */
  async deactivateProduct(id: number): Promise<Product> {
    try {
      const product = await this.productRepository.deactivate(id);
      return product;
    } catch (error) {
      console.error("Error deactivating product:", error);
      throw error;
    }
  }

  /**
   * Delete an image
   * @param {number} productId Product ID
   * @param {number} imageId Image ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteImage(productId: number, imageId: number): Promise<boolean> {
    try {
      const success = await this.imageRepository.delete(imageId);
      return success;
    } catch (error) {
      console.error("Error deleting image:", error);
      throw error;
    }
  }

  /**
   * Get a category by ID
   * @param {number} id Category ID
   * @returns {Promise<Category>} Category
   */
  async getCategoryById(id: number): Promise<Category> {
    try {
      const category = await this.categoryRepository.findById(id);
      return category;
    } catch (error) {
      console.error("Error getting category:", error);
      throw error;
    }
  }
}
