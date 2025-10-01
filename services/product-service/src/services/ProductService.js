/**
 * ProductService
 * Business logic layer for product management
 */
const Category = require("../models/Category");
const Product = require("../models/Product");
const ProductImage = require("../models/ProductImage");
const ProductImageVariant = require("../models/ProductImageVariant");
const CategoryRepository = require("../repositories/CategoryRepository");
const ProductRepository = require("../repositories/ProductRepository");
const ProductImageRepository = require("../repositories/ProductImageRepository");
const ProductImageVariantRepository = require("../repositories/ProductImageVariantRepository");

class ProductService {
  constructor(pool) {
    this.categoryRepository = new CategoryRepository(pool);
    this.productRepository = new ProductRepository(pool);
    this.imageRepository = new ProductImageRepository(pool);
    this.variantRepository = new ProductImageVariantRepository(pool);
  }

  // Category management methods

  /**
   * Create a new category
   * @param {Object} data Category data
   * @returns {Promise<Category>} Created category
   */
  async createCategory(data) {
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
  async updateCategory(id, data) {
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
  async deleteCategory(id) {
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
   * List all categories
   * @returns {Promise<Category[]>} Array of categories
   */
  async listCategories() {
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
  async createProduct(data) {
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
  async updateProduct(id, data) {
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

      // If category is being updated, verify it exists
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
  async deleteProduct(id) {
    try {
      const product = await this.productRepository.getById(id);
      if (!product) {
        throw new Error("Product not found");
      }

      // Delete all image variants first
      const images = await this.imageRepository.listByProduct(id);
      for (const image of images) {
        await this.variantRepository.deleteAllByImage(image.id);
      }

      // Delete all images
      for (const image of images) {
        await this.imageRepository.delete(image);
      }

      // Delete product
      return await this.productRepository.delete(product);
    } catch (error) {
      console.error("Error deleting product:", error);
      throw error;
    }
  }

  /**
   * List products with pagination and search
   * @param {Object} options Pagination and search options
   * @returns {Promise<Object>} Products and pagination info
   */
  async listProducts(options = {}) {
    try {
      return await this.productRepository.listAll(options);
    } catch (error) {
      console.error("Error listing products:", error);
      throw error;
    }
  }

  /**
   * List products by category
   * @param {number} categoryId Category ID
   * @returns {Promise<Product[]>} Array of products in category
   */
  async listProductsByCategory(categoryId) {
    try {
      return await this.productRepository.listByCategory(categoryId);
    } catch (error) {
      console.error("Error listing products by category:", error);
      throw error;
    }
  }

  /**
   * Get product by ID
   * @param {number} id Product ID
   * @returns {Promise<Product|null>} Product or null if not found
   */
  async getProductById(id) {
    try {
      return await this.productRepository.getByIdWithJoins(id);
    } catch (error) {
      console.error("Error getting product by ID:", error);
      throw error;
    }
  }

  /**
   * Activate product
   * @param {number} id Product ID
   * @returns {Promise<boolean>} True if activated successfully
   */
  async activateProduct(id) {
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
  async deactivateProduct(id) {
    try {
      return await this.productRepository.deactivate(id);
    } catch (error) {
      console.error("Error deactivating product:", error);
      throw error;
    }
  }

  // Image management methods

  /**
   * Add image to product
   * @param {number} productId Product ID
   * @param {Object} imageData Image data
   * @returns {Promise<ProductImage>} Created image
   */
  async addImage(productId, imageData) {
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
   * @param {number} imageId Image ID
   * @param {Object} imageData Image data
   * @returns {Promise<ProductImage>} Updated image
   */
  async updateImage(imageId, imageData) {
    try {
      const image = await this.imageRepository.getById(imageId);
      if (!image) {
        throw new Error("Image not found");
      }

      // Update image entity
      Object.assign(image, imageData);
      image.id = imageId; // Ensure ID is preserved

      return await this.imageRepository.update(image);
    } catch (error) {
      console.error("Error updating image:", error);
      throw error;
    }
  }

  /**
   * Delete image
   * @param {number} imageId Image ID
   * @returns {Promise<boolean>} True if deleted successfully
   */
  async deleteImage(imageId) {
    try {
      const image = await this.imageRepository.getById(imageId);
      if (!image) {
        throw new Error("Image not found");
      }

      // Delete all variants first
      await this.variantRepository.deleteAllByImage(imageId);

      // Delete image
      return await this.imageRepository.delete(image);
    } catch (error) {
      console.error("Error deleting image:", error);
      throw error;
    }
  }

  /**
   * List images for product
   * @param {number} productId Product ID
   * @returns {Promise<ProductImage[]>} Array of images
   */
  async listImages(productId) {
    try {
      return await this.imageRepository.listActiveByProduct(productId);
    } catch (error) {
      console.error("Error listing images:", error);
      throw error;
    }
  }

  /**
   * Activate image
   * @param {number} imageId Image ID
   * @returns {Promise<boolean>} True if activated successfully
   */
  async activateImage(imageId) {
    try {
      return await this.imageRepository.activate(imageId);
    } catch (error) {
      console.error("Error activating image:", error);
      throw error;
    }
  }

  /**
   * Deactivate image
   * @param {number} imageId Image ID
   * @returns {Promise<boolean>} True if deactivated successfully
   */
  async deactivateImage(imageId) {
    try {
      return await this.imageRepository.deactivate(imageId);
    } catch (error) {
      console.error("Error deactivating image:", error);
      throw error;
    }
  }

  // Image variant management methods

  /**
   * Add image variant
   * @param {number} imageId Image ID
   * @param {Object} variantData Variant data
   * @returns {Promise<ProductImageVariant>} Created variant
   */
  async addImageVariant(imageId, variantData) {
    try {
      // Verify image exists
      const image = await this.imageRepository.getById(imageId);
      if (!image) {
        throw new Error("Image not found");
      }

      // Check if variant type already exists for this image
      const variantExists = await this.variantRepository.variantExists(
        imageId,
        variantData.variantType
      );
      if (variantExists) {
        throw new Error("Variant type already exists for this image");
      }

      // Create variant entity
      const variant = new ProductImageVariant({
        ...variantData,
        imageId,
      });

      return await this.variantRepository.save(variant);
    } catch (error) {
      console.error("Error adding image variant:", error);
      throw error;
    }
  }

  /**
   * Update image variant
   * @param {number} variantId Variant ID
   * @param {Object} variantData Variant data
   * @returns {Promise<ProductImageVariant>} Updated variant
   */
  async updateImageVariant(variantId, variantData) {
    try {
      const variant = await this.variantRepository.getById(variantId);
      if (!variant) {
        throw new Error("Variant not found");
      }

      // If variant type is being updated, check for conflicts
      if (
        variantData.variantType &&
        variantData.variantType !== variant.variantType
      ) {
        const variantExists = await this.variantRepository.variantExists(
          variant.imageId,
          variantData.variantType
        );
        if (variantExists) {
          throw new Error("Variant type already exists for this image");
        }
      }

      // Update variant entity
      Object.assign(variant, variantData);
      variant.id = variantId; // Ensure ID is preserved

      return await this.variantRepository.update(variant);
    } catch (error) {
      console.error("Error updating image variant:", error);
      throw error;
    }
  }

  /**
   * Delete image variant
   * @param {number} variantId Variant ID
   * @returns {Promise<boolean>} True if deleted successfully
   */
  async deleteImageVariant(variantId) {
    try {
      const variant = await this.variantRepository.getById(variantId);
      if (!variant) {
        throw new Error("Variant not found");
      }

      return await this.variantRepository.delete(variant);
    } catch (error) {
      console.error("Error deleting image variant:", error);
      throw error;
    }
  }

  /**
   * List image variants
   * @param {number} imageId Image ID
   * @returns {Promise<ProductImageVariant[]>} Array of variants
   */
  async listImageVariants(imageId) {
    try {
      return await this.variantRepository.listByImage(imageId);
    } catch (error) {
      console.error("Error listing image variants:", error);
      throw error;
    }
  }

  /**
   * Get top products (for admin dashboard)
   * @param {number} limit Number of products to return
   * @returns {Promise<Array>} List of top products
   */
  async getTopProducts(limit = 5) {
    try {
      // For now, return the most recent products
      // In a real implementation, this would be based on sales data
      const products = await this.productRepository.list({
        limit: limit,
        orderBy: "created_at",
        orderDirection: "DESC",
      });

      return products;
    } catch (error) {
      console.error("Error getting top products:", error);
      throw error;
    }
  }

  /**
   * Toggle product status (active/inactive)
   * @param {number} id Product ID
   * @returns {Promise<Product>} Updated product
   */
  async toggleProductStatus(id) {
    try {
      const product = await this.productRepository.getById(id);
      if (!product) {
        throw new Error("Product not found");
      }

      // Toggle the isActive status
      const newStatus = !product.isActive;

      // Use direct database update to avoid validation issues
      const result = await this.productRepository.pool.query(
        `UPDATE products 
         SET is_active = $1, updated_at = NOW()
         WHERE id = $2
         RETURNING id, name, description, price, vat_rate, category_id, 
                   is_active, created_at, updated_at`,
        [newStatus, id]
      );

      if (result.rows.length === 0) {
        throw new Error("Product not found");
      }

      return Product.fromDbRow(result.rows[0]);
    } catch (error) {
      console.error("Error toggling product status:", error);
      throw error;
    }
  }
}

module.exports = ProductService;
