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
   * Valider les données produit (sans les créer)
   * Utilise les mêmes règles que Joi pour retourner des erreurs structurées par champ
   * @param productData Données produit à valider
   * @returns Résultat de validation avec erreurs par champ
   */
  validateProductData(productData: {
    name?: string;
    description?: string;
    price?: number;
    vatRate?: number;
    categoryId?: number;
    isActive?: boolean;
    stock?: number;
  }): {
    isValid: boolean;
    errors: { field: string; message: string }[];
  } {
    const errors: { field: string; message: string }[] = [];

    // Validation du nom (obligatoire)
    if (!productData.name || productData.name.trim().length === 0) {
      errors.push({
        field: "name",
        message: "Le nom du produit est requis",
      });
    } else if (productData.name.length > 255) {
      errors.push({
        field: "name",
        message: "Le nom ne doit pas dépasser 255 caractères",
      });
    }

    // Validation du prix (obligatoire)
    if (productData.price === undefined || productData.price === null) {
      errors.push({
        field: "price",
        message: "Le prix est requis",
      });
    } else if (productData.price <= 0) {
      errors.push({
        field: "price",
        message: "Le prix doit être supérieur à 0",
      });
    }

    // Validation du taux de TVA (obligatoire)
    if (productData.vatRate === undefined || productData.vatRate === null) {
      errors.push({
        field: "vatRate",
        message: "Le taux de TVA est requis",
      });
    } else if (productData.vatRate < 0 || productData.vatRate > 100) {
      errors.push({
        field: "vatRate",
        message: "Le taux de TVA doit être entre 0 et 100",
      });
    }

    // Validation de la catégorie (obligatoire)
    if (!productData.categoryId || productData.categoryId <= 0) {
      errors.push({
        field: "categoryId",
        message: "La catégorie est requise",
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

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
   * Décrémenter le stock d'un produit
   * @param {number} id ID du produit
   * @param {number} quantity Quantité à décrémenter
   * @returns {Promise<Product>} Produit mis à jour
   * @throws {Error} Si le produit n'existe pas ou si le stock est insuffisant
   */
  /**
   * Décrémenter le stock d'un produit de manière atomique
   * Utilise une requête SQL atomique pour éviter les conditions de course
   * @param {number} id ID du produit
   * @param {number} quantity Quantité à décrémenter
   * @returns {Promise<Product>} Produit avec stock mis à jour
   * @throws {Error} Si le produit n'existe pas ou si le stock est insuffisant
   */
  async decrementStock(id: number, quantity: number): Promise<Product> {
    if (quantity <= 0) {
      throw new Error("La quantité à décrémenter doit être positive");
    }

    // Vérifier que le produit existe
    const product = await this.productRepository.getProductById(id);
    if (!product) {
      throw new Error("Produit non trouvé");
    }

    // Décrémenter le stock de manière atomique
    // Cette méthode garantit qu'aucune condition de course ne peut se produire
    const updatedProduct =
      await this.productRepository.decrementStockAtomically(id, quantity);

    if (!updatedProduct) {
      // Récupérer le stock actuel pour l'erreur
      const currentProduct = await this.productRepository.getProductById(id);
      const currentStock = currentProduct?.stock ?? 0;
      throw new Error(
        `Stock insuffisant. Stock disponible: ${currentStock}, quantité demandée: ${quantity}`
      );
    }

    return updatedProduct;
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
    categoryId?: number;
    categories?: number[]; // Support pour multi-catégories (ProductFilterDTO)
    search?: string;
    activeOnly?: boolean;
    minPrice?: number; // Support pour plage de prix (ProductFilterDTO)
    maxPrice?: number; // Support pour plage de prix (ProductFilterDTO)
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }): Promise<Product[]> {
    return await this.productRepository.listProducts(options);
  }

  /**
   * Obtenir les statistiques formatées pour le dashboard
   * @param {number} year Année pour filtrer les statistiques
   * @returns {Promise<{productsCount: number}>} Statistiques formatées
   */
  async getDashboardStatistics(year: number): Promise<{
    productsCount: number;
  }> {
    try {
      // Récupérer le nombre de produits pour l'année
      // Note: Le filtrage par année n'est pas encore implémenté dans listProducts
      // Pour l'instant, on retourne le total de tous les produits
      const productsList = await this.productRepository.listProducts({});
      const productsCount = productsList.length;

      return {
        productsCount,
      };
    } catch (error: any) {
      console.error("Error getting dashboard statistics:", error);
      throw new Error(
        `Failed to retrieve dashboard statistics: ${error.message}`
      );
    }
  }

  /**
   * Méthode privée pour définir le statut actif d'un produit
   * @param {number} id ID du produit
   * @param {boolean} active True pour activer, false pour désactiver
   * @returns {Promise<Product|null>} Produit mis à jour ou null si non trouvé
   */
  private async setProductActiveStatus(
    id: number,
    active: boolean
  ): Promise<Product | null> {
    return await this.updateProduct(id, { is_active: active });
  }

  /**
   * Activer un produit
   * @param {number} id ID du produit
   * @returns {Promise<Product|null>} Produit mis à jour ou null si non trouvé
   */
  async activateProduct(id: number): Promise<Product | null> {
    return await this.setProductActiveStatus(id, true);
  }

  /**
   * Désactiver un produit
   * @param {number} id ID du produit
   * @returns {Promise<Product|null>} Produit mis à jour ou null si non trouvé
   */
  async deactivateProduct(id: number): Promise<Product | null> {
    return await this.setProductActiveStatus(id, false);
  }

  // ===== MÉTHODES CATÉGORIE =====

  /**
   * Valider les données catégorie (sans les créer)
   * Utilise les mêmes règles que Joi pour retourner des erreurs structurées par champ
   * @param categoryData Données catégorie à valider
   * @returns Résultat de validation avec erreurs par champ
   */
  validateCategoryData(categoryData: { name?: string; description?: string }): {
    isValid: boolean;
    errors: { field: string; message: string }[];
  } {
    const errors: { field: string; message: string }[] = [];

    // Validation du nom (obligatoire)
    if (!categoryData.name || categoryData.name.trim().length === 0) {
      errors.push({
        field: "name",
        message: "Le nom de la catégorie est requis",
      });
    } else if (categoryData.name.length > 100) {
      errors.push({
        field: "name",
        message: "Le nom ne doit pas dépasser 100 caractères",
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

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
    search?: string;
    sortBy?: "name" | "createdAt";
    sortOrder?: "asc" | "desc";
  }): Promise<Category[]> {
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

    // L'image doit avoir image_data
    const hasImageData =
      imageData.image_data && imageData.image_data.length > 0;
    if (!hasImageData) {
      throw new Error("L'image doit avoir des données binaires (image_data)");
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
   * @param {boolean} includeImageData Si true, inclut les données binaires de l'image
   * @returns {Promise<ProductImage|null>} Image ou null si non trouvée
   */
  async getImageById(
    id: number,
    includeImageData: boolean = false
  ): Promise<ProductImage | null> {
    return await this.imageRepository.getImageById(id, includeImageData);
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
