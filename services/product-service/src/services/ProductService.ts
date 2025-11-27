/**
 * ProductService
 * Couche de logique métier pour la gestion des produits
 *
 * Architecture : Pattern Service
 * - Orchestration de la logique métier
 * - Coordination des repositories
 * - Validation des données
 */

import { Pool } from "pg";
import { ProductRepository } from "../repositories/ProductRepository";
import { CategoryRepository } from "../repositories/CategoryRepository";
import { ProductImageRepository } from "../repositories/ProductImageRepository";
import Product, { ProductData } from "../models/Product";
import Category, { CategoryData } from "../models/Category";
import ProductImage, { ProductImageData } from "../models/ProductImage";

export default class ProductService {
  private productRepository: ProductRepository;
  private categoryRepository: CategoryRepository;
  private imageRepository: ProductImageRepository;

  constructor(pool: Pool) {
    this.productRepository = new ProductRepository(pool);
    this.categoryRepository = new CategoryRepository(pool);
    this.imageRepository = new ProductImageRepository(pool);
  }

  // ===== MÉTHODES PRODUIT =====

  /**
   * Créer un nouveau produit
   * @param {Partial<ProductData>} productData Données du produit
   * @returns {Promise<Product>} Produit créé
   */
  async createProduct(productData: Partial<ProductData>): Promise<Product> {
    // Valider les champs requis
    if (!productData.name) {
      throw new Error("Le nom du produit est requis");
    }
    if (!productData.price || productData.price <= 0) {
      throw new Error("Le prix du produit doit être supérieur à 0");
    }
    if (!productData.category_id) {
      throw new Error("L'ID de catégorie est requis");
    }

    // Vérifier si la catégorie existe
    const category = await this.categoryRepository.getCategoryById(
      productData.category_id
    );
    if (!category) {
      throw new Error("Catégorie non trouvée");
    }

    // Vérifier si le nom du produit existe déjà
    const existingProduct = await this.productRepository.getProductById(0); // Ceci sera mis à jour avec une vérification de nom appropriée
    if (existingProduct && existingProduct.name === productData.name) {
      throw new Error("Un produit avec ce nom existe déjà");
    }

    return await this.productRepository.createProduct(
      productData as ProductData
    );
  }

  /**
   * Obtenir un produit par ID
   * @param {number} id ID du produit
   * @returns {Promise<Product|null>} Produit ou null si non trouvé
   */
  async getProductById(id: number): Promise<Product | null> {
    return await this.productRepository.getProductById(id);
  }

  /**
   * Mettre à jour un produit
   * @param {number} id ID du produit
   * @param {Partial<ProductData>} productData Données du produit à mettre à jour
   * @returns {Promise<Product|null>} Produit mis à jour ou null si non trouvé
   */
  async updateProduct(
    id: number,
    productData: Partial<ProductData>
  ): Promise<Product | null> {
    // Vérifier si le produit existe
    const existingProduct = await this.productRepository.getProductById(id);
    if (!existingProduct) {
      throw new Error("Produit non trouvé");
    }

    // Si la catégorie est modifiée, vérifier si la nouvelle catégorie existe
    if (
      productData.category_id &&
      productData.category_id !== existingProduct.categoryId
    ) {
      const category = await this.categoryRepository.getCategoryById(
        productData.category_id
      );
      if (!category) {
        throw new Error("Catégorie non trouvée");
      }
    }

    // Si le nom est modifié, vérifier si le nouveau nom existe déjà
    if (productData.name && productData.name !== existingProduct.name) {
      // Ceci nécessiterait une vérification d'unicité du nom appropriée dans le repository
      // Pour l'instant, nous ignorons cette validation
    }

    return await this.productRepository.updateProduct(id, productData);
  }

  /**
   * Supprimer un produit
   * @param {number} id ID du produit
   * @returns {Promise<boolean>} True si supprimé, false si non trouvé
   */
  async deleteProduct(id: number): Promise<boolean> {
    return await this.productRepository.deleteProduct(id);
  }

  /**
   * Lister les produits avec pagination et filtrage
   * @param {Object} options Options de liste
   * @returns {Promise<Object>} Produits avec informations de pagination
   */
  async listProducts(options: {
    page: number;
    limit: number;
    categoryId?: number;
    categories?: number[]; // Support pour multi-catégories (ProductFilterDTO)
    search?: string;
    activeOnly?: boolean;
    minPrice?: number; // Support pour plage de prix (ProductFilterDTO)
    maxPrice?: number; // Support pour plage de prix (ProductFilterDTO)
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }): Promise<{
    products: Product[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    return await this.productRepository.listProducts(options);
  }

  /**
   * Activer un produit
   * @param {number} id ID du produit
   * @returns {Promise<Product|null>} Produit mis à jour ou null si non trouvé
   */
  async activateProduct(id: number): Promise<Product | null> {
    return await this.updateProduct(id, { is_active: true });
  }

  /**
   * Désactiver un produit
   * @param {number} id ID du produit
   * @returns {Promise<Product|null>} Produit mis à jour ou null si non trouvé
   */
  async deactivateProduct(id: number): Promise<Product | null> {
    return await this.updateProduct(id, { is_active: false });
  }

  // ===== MÉTHODES CATÉGORIE =====

  /**
   * Créer une nouvelle catégorie
   * @param {Partial<CategoryData>} categoryData Données de la catégorie
   * @returns {Promise<Category>} Catégorie créée
   */
  async createCategory(categoryData: Partial<CategoryData>): Promise<Category> {
    // Valider les champs requis
    if (!categoryData.name) {
      throw new Error("Le nom de la catégorie est requis");
    }

    // Vérifier si le nom de la catégorie existe déjà
    const nameExists = await this.categoryRepository.categoryNameExists(
      categoryData.name
    );
    if (nameExists) {
      throw new Error("Une catégorie avec ce nom existe déjà");
    }

    return await this.categoryRepository.createCategory(
      categoryData as CategoryData
    );
  }

  /**
   * Obtenir une catégorie par ID
   * @param {number} id ID de la catégorie
   * @returns {Promise<Category|null>} Catégorie ou null si non trouvée
   */
  async getCategoryById(id: number): Promise<Category | null> {
    return await this.categoryRepository.getCategoryById(id);
  }

  /**
   * Mettre à jour une catégorie
   * @param {number} id ID de la catégorie
   * @param {Partial<CategoryData>} categoryData Données de la catégorie à mettre à jour
   * @returns {Promise<Category|null>} Catégorie mise à jour ou null si non trouvée
   */
  async updateCategory(
    id: number,
    categoryData: Partial<CategoryData>
  ): Promise<Category | null> {
    // Vérifier si la catégorie existe
    const existingCategory = await this.categoryRepository.getCategoryById(id);
    if (!existingCategory) {
      throw new Error("Catégorie non trouvée");
    }

    // Si le nom est modifié, vérifier si le nouveau nom existe déjà
    if (categoryData.name && categoryData.name !== existingCategory.name) {
      const nameExists = await this.categoryRepository.categoryNameExists(
        categoryData.name,
        id
      );
      if (nameExists) {
        throw new Error("Le nom de la catégorie existe déjà");
      }
    }

    return await this.categoryRepository.updateCategory(id, categoryData);
  }

  /**
   * Supprimer une catégorie
   * @param {number} id ID de la catégorie
   * @returns {Promise<boolean>} True si supprimée, false si non trouvée
   */
  async deleteCategory(id: number): Promise<boolean> {
    return await this.categoryRepository.deleteCategory(id);
  }

  /**
   * Lister toutes les catégories
   * @returns {Promise<Category[]>} Liste des catégories
   */
  async listCategories(): Promise<Category[]> {
    return await this.categoryRepository.listCategories();
  }

  /**
   * Lister les catégories avec pagination et recherche (CategorySearchDTO)
   * @param {Object} options Options de recherche
   * @returns {Promise<Object>} Catégories avec informations de pagination
   */
  async listCategoriesWithSearch(options: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: "name" | "createdAt";
    sortOrder?: "asc" | "desc";
  }): Promise<{
    categories: Category[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    return await this.categoryRepository.listCategoriesWithSearch(options);
  }

  // ===== MÉTHODES IMAGE DE PRODUIT =====

  /**
   * Créer une nouvelle image de produit
   * @param {Partial<ProductImageData>} imageData Données de l'image
   * @returns {Promise<ProductImage>} Image créée
   */
  async createImage(
    imageData: Partial<ProductImageData>
  ): Promise<ProductImage> {
    // Valider les champs requis
    if (!imageData.product_id) {
      throw new Error("L'ID du produit est requis");
    }
    if (!imageData.filename) {
      throw new Error("Le nom de fichier est requis");
    }
    if (!imageData.file_path) {
      throw new Error("Le chemin du fichier est requis");
    }

    // Vérifier si le produit existe
    const product = await this.productRepository.getProductById(
      imageData.product_id
    );
    if (!product) {
      throw new Error("Produit non trouvé");
    }

    return await this.imageRepository.createImage(
      imageData as ProductImageData
    );
  }

  /**
   * Obtenir une image par ID
   * @param {number} id ID de l'image
   * @returns {Promise<ProductImage|null>} Image ou null si non trouvée
   */
  async getImageById(id: number): Promise<ProductImage | null> {
    return await this.imageRepository.getImageById(id);
  }

  /**
   * Supprimer une image
   * @param {number} productId ID du produit
   * @param {number} imageId ID de l'image
   * @returns {Promise<boolean>} True si supprimée, false si non trouvée
   */
  async deleteImage(productId: number, imageId: number): Promise<boolean> {
    return await this.imageRepository.deleteImageByProductAndId(
      productId,
      imageId
    );
  }

  /**
   * Lister les images d'un produit
   * @param {number} productId ID du produit
   * @returns {Promise<ProductImage[]>} Liste des images
   */
  async listImages(productId: number): Promise<ProductImage[]> {
    return await this.imageRepository.listImagesByProduct(productId);
  }
}
