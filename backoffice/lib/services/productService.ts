import {
  Product,
  Category,
  ApiResponse,
  PaginationParams,
  CreateProductRequest,
  CreateProductWithImagesRequest,
  CreateProductWithImagesResponse,
  UpdateProductRequest,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  ImageUploadResponse,
} from "../../../shared-types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:13000";

class ProductService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      // Essayer de récupérer le message d'erreur de l'API
      try {
        const errorData = await response.json();
        const error = new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
        // Préserver le code de statut HTTP
        (error as any).status = response.status;
        throw error;
      } catch (parseError) {
        // Si on ne peut pas parser le JSON, utiliser le message générique
        const error = new Error(`HTTP error! status: ${response.status}`);
        (error as any).status = response.status;
        throw error;
      }
    }

    return response.json();
  }

  // ===========================================
  // PRODUCT METHODS
  // ===========================================

  async getProducts(
    params?: PaginationParams
  ): Promise<ApiResponse<Product[]>> {
    const searchParams = new URLSearchParams();

    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    if (params?.search) searchParams.append("search", params.search);
    if (params?.sortBy) searchParams.append("sortBy", params.sortBy);
    if (params?.sortOrder) searchParams.append("sortOrder", params.sortOrder);

    const queryString = searchParams.toString();
    const endpoint = `/api/admin/products${
      queryString ? `?${queryString}` : ""
    }`;

    try {
      // Récupérer le token d'authentification depuis le localStorage
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("auth_token")
          : null;
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // L'API retourne { products: [...], pagination: {...} }
      // On doit adapter le format pour correspondre à ApiResponse<Product[]>
      return {
        data: data.products || [],
        pagination: data.pagination,
        message: "Products retrieved successfully",
      };
    } catch (error) {
      console.error("Error fetching products:", error);
      return {
        data: undefined,
        error:
          error instanceof Error ? error.message : "Failed to fetch products",
      };
    }
  }

  async getProduct(id: number): Promise<ApiResponse<Product>> {
    // Récupérer le token d'authentification depuis le localStorage
    const token =
      typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    if (!token) {
      throw new Error("Authentication token not found");
    }

    return this.makeRequest<Product>(`/api/admin/products/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async createProduct(
    productData: CreateProductRequest
  ): Promise<ApiResponse<Product>> {
    try {
      // Récupérer le token d'authentification depuis le localStorage
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("auth_token")
          : null;
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const error = new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
        (error as any).status = response.status;
        throw error;
      }

      const data = await response.json();
      // Le serveur retourne { message: "...", product: {...} }
      // On doit adapter pour correspondre à ApiResponse<Product>
      return {
        data: data.product,
        message: data.message,
      };
    } catch (error) {
      console.error("Error creating product:", error);
      return {
        data: undefined,
        error:
          error instanceof Error ? error.message : "Failed to create product",
      };
    }
  }

  async updateProduct(
    id: number,
    productData: UpdateProductRequest
  ): Promise<ApiResponse<Product>> {
    try {
      // Récupérer le token d'authentification depuis le localStorage
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("auth_token")
          : null;
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/products/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const error = new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
        (error as any).status = response.status;
        throw error;
      }

      const data = await response.json();
      // Le serveur retourne { message: "...", product: {...} }
      // On doit adapter pour correspondre à ApiResponse<Product>
      return {
        data: data.product,
        message: data.message,
      };
    } catch (error) {
      console.error("Error updating product:", error);
      return {
        data: undefined,
        error:
          error instanceof Error ? error.message : "Failed to update product",
      };
    }
  }

  async deleteProduct(id: number): Promise<ApiResponse<void>> {
    // Récupérer le token d'authentification depuis le localStorage
    const token =
      typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    if (!token) {
      throw new Error("Authentication token not found");
    }

    return this.makeRequest<void>(`/api/admin/products/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async createProductWithImages(
    productData: CreateProductWithImagesRequest
  ): Promise<ApiResponse<CreateProductWithImagesResponse>> {
    try {
      // Récupérer le token d'authentification depuis le localStorage
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("auth_token")
          : null;
      if (!token) {
        throw new Error("Authentication token not found");
      }

      // Create FormData for multipart upload
      const formData = new FormData();

      // Add product data
      formData.append("name", productData.name);
      formData.append("description", productData.description || "");
      formData.append("price", productData.price.toString());
      formData.append("vatRate", productData.vatRate.toString());
      formData.append("categoryId", productData.categoryId.toString());
      formData.append("isActive", productData.isActive?.toString() || "true");

      // Add images
      if (productData.images && productData.images.length > 0) {
        productData.images.forEach((image, index) => {
          formData.append("images", image);
        });
      }

      // Upload directly to product service (bypassing API Gateway for file uploads)
      const PRODUCT_SERVICE_URL = "http://localhost:13002";

      const response = await fetch(
        `${PRODUCT_SERVICE_URL}/api/admin/products/with-images`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            // Don't set Content-Type header - let the browser set it for FormData
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        const error = new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
        (error as any).status = response.status;
        throw error;
      }

      const data = await response.json();
      return {
        data: data,
        message: data.message,
      };
    } catch (error) {
      console.error("Error creating product with images:", error);
      return {
        data: undefined,
        error:
          error instanceof Error
            ? error.message
            : "Failed to create product with images",
      };
    }
  }

  async uploadImage(
    productId: number,
    image: File,
    altText?: string,
    description?: string,
    orderIndex?: number
  ): Promise<ApiResponse<ImageUploadResponse>> {
    try {
      // Récupérer le token d'authentification depuis le localStorage
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("auth_token")
          : null;
      if (!token) {
        throw new Error("Authentication token not found");
      }

      // Create FormData for multipart upload
      const formData = new FormData();
      formData.append("image", image);
      if (altText) formData.append("altText", altText);
      if (description) formData.append("description", description);
      if (orderIndex !== undefined)
        formData.append("orderIndex", orderIndex.toString());

      const response = await fetch(
        `${API_BASE_URL}/api/admin/products/${productId}/images`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            // Don't set Content-Type header - let the browser set it for FormData
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        const error = new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
        (error as any).status = response.status;
        throw error;
      }

      const data = await response.json();
      return {
        data: data.image,
        message: data.message,
      };
    } catch (error) {
      console.error("Error uploading image:", error);
      return {
        data: undefined,
        error:
          error instanceof Error ? error.message : "Failed to upload image",
      };
    }
  }

  async activateProduct(id: number): Promise<ApiResponse<Product>> {
    try {
      // Récupérer le token d'authentification depuis le localStorage
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("auth_token")
          : null;
      if (!token) {
        throw new Error("Authentication token not found");
      }

      // Utiliser la route POST pour activer le produit
      const response = await fetch(
        `${API_BASE_URL}/api/admin/products/${id}/activate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        const error = new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
        (error as any).status = response.status;
        throw error;
      }

      const data = await response.json();
      return {
        data: data.product,
        message: data.message,
      };
    } catch (error) {
      console.error("Error activating product:", error);
      return {
        data: undefined,
        error:
          error instanceof Error ? error.message : "Failed to activate product",
      };
    }
  }

  async deactivateProduct(id: number): Promise<ApiResponse<Product>> {
    try {
      // Récupérer le token d'authentification depuis le localStorage
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("auth_token")
          : null;
      if (!token) {
        throw new Error("Authentication token not found");
      }

      // Utiliser la route POST pour désactiver le produit
      const response = await fetch(
        `${API_BASE_URL}/api/admin/products/${id}/deactivate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        const error = new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
        (error as any).status = response.status;
        throw error;
      }

      const data = await response.json();
      return {
        data: data.product,
        message: data.message,
      };
    } catch (error) {
      console.error("Error deactivating product:", error);
      return {
        data: undefined,
        error:
          error instanceof Error
            ? error.message
            : "Failed to deactivate product",
      };
    }
  }

  // ===========================================
  // CATEGORY METHODS
  // ===========================================

  async getCategories(): Promise<ApiResponse<Category[]>> {
    try {
      // Récupérer le token d'authentification depuis le localStorage
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("auth_token")
          : null;
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/categories`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // L'API retourne directement un tableau, on doit l'envelopper dans ApiResponse
      return {
        data: data,
        message: "Categories retrieved successfully",
      };
    } catch (error) {
      console.error("Error fetching categories:", error);
      return {
        data: undefined,
        error:
          error instanceof Error ? error.message : "Failed to fetch categories",
      };
    }
  }

  async getCategory(id: number): Promise<ApiResponse<Category>> {
    // Récupérer le token d'authentification depuis le localStorage
    const token =
      typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    if (!token) {
      throw new Error("Authentication token not found");
    }

    return this.makeRequest<Category>(`/api/admin/categories/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async createCategory(
    categoryData: CreateCategoryRequest
  ): Promise<ApiResponse<Category>> {
    try {
      // Récupérer le token d'authentification depuis le localStorage
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("auth_token")
          : null;
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(categoryData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const error = new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
        (error as any).status = response.status;
        throw error;
      }

      const data = await response.json();
      // Le serveur retourne { message: "...", category: {...} }
      // On doit adapter pour correspondre à ApiResponse<Category>
      return {
        data: data.category,
        message: data.message,
      };
    } catch (error) {
      console.error("Error creating category:", error);
      return {
        data: undefined,
        error:
          error instanceof Error ? error.message : "Failed to create category",
      };
    }
  }

  async updateCategory(
    id: number,
    categoryData: UpdateCategoryRequest
  ): Promise<ApiResponse<Category>> {
    try {
      // Récupérer le token d'authentification depuis le localStorage
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("auth_token")
          : null;
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await fetch(
        `${API_BASE_URL}/api/admin/categories/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(categoryData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        const error = new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
        (error as any).status = response.status;
        throw error;
      }

      const data = await response.json();
      // Le serveur retourne { message: "...", category: {...} }
      // On doit adapter pour correspondre à ApiResponse<Category>
      return {
        data: data.category,
        message: data.message,
      };
    } catch (error) {
      console.error("Error updating category:", error);
      return {
        data: undefined,
        error:
          error instanceof Error ? error.message : "Failed to update category",
      };
    }
  }

  async deleteCategory(id: number): Promise<ApiResponse<void>> {
    try {
      // Récupérer le token d'authentification depuis le localStorage
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("auth_token")
          : null;
      if (!token) {
        throw new Error("Authentication token not found");
      }

      return await this.makeRequest<void>(`/api/admin/categories/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error: any) {
      // Si c'est une erreur 409 (Conflict), c'est probablement parce que la catégorie a des produits
      if (error.status === 409) {
        const customError = new Error("CATEGORY_HAS_PRODUCTS");
        (customError as any).status = 409;
        throw customError;
      }
      throw error;
    }
  }

  async deleteImage(
    productId: number,
    imageId: number
  ): Promise<ApiResponse<any>> {
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("auth_token")
          : null;
      if (!token) {
        throw new Error("Authentication token not found");
      }

      // Use direct product service URL for image deletion
      const PRODUCT_SERVICE_URL = "http://localhost:13002";

      const response = await fetch(
        `${PRODUCT_SERVICE_URL}/api/admin/products/${productId}/images/${imageId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        const error = new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
        (error as any).status = response.status;
        throw error;
      }

      const data = await response.json();
      return {
        data: data,
        message: data.message || "Image deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting image:", error);
      return {
        data: null,
        error:
          error instanceof Error ? error.message : "Failed to delete image",
      };
    }
  }

  async addImagesToProduct(
    productId: number,
    images: File[]
  ): Promise<ApiResponse<CreateProductWithImagesResponse>> {
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("auth_token")
          : null;
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const formData = new FormData();

      if (images && images.length > 0) {
        images.forEach((image, index) => {
          formData.append("newImages", image);
        });
      }

      // Upload directly to product service (bypassing API Gateway for file uploads)
      const PRODUCT_SERVICE_URL = "http://localhost:13002";

      const response = await fetch(
        `${PRODUCT_SERVICE_URL}/api/admin/products/${productId}/add-images`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            // Don't set Content-Type header - let the browser set it for FormData
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        const error = new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
        (error as any).status = response.status;
        throw error;
      }

      const data = await response.json();
      return {
        data: data,
        message: data.message,
      };
    } catch (error) {
      console.error("Error adding images to product:", error);
      return {
        data: null,
        error:
          error instanceof Error
            ? error.message
            : "Failed to add images to product",
      };
    }
  }
}

export const productService = new ProductService();
