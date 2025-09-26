import {
  ProductData,
  CategoryData,
  ProductImageData,
  ProductListOptions,
  ProductListResult,
  ImageUploadOptions,
} from "../../../shared-types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:13000";

class ProductService {
  // ===========================================
  // PRODUCT METHODS
  // ===========================================

  async getProducts(params?: ProductListOptions): Promise<ProductListResult> {
    const searchParams = new URLSearchParams();

    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    if (params?.search) searchParams.append("search", params.search);
    if (params?.categoryId)
      searchParams.append("categoryId", params.categoryId.toString());
    if (params?.activeOnly !== undefined)
      searchParams.append("activeOnly", params.activeOnly.toString());

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
      // On doit adapter le format pour correspondre à ProductListResult
      return {
        products: data.products || [],
        pagination: data.pagination,
      };
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  }

  async getProduct(id: number): Promise<ProductData> {
    // Récupérer le token d'authentification depuis le localStorage
    const token =
      typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    if (!token) {
      throw new Error("Authentication token not found");
    }

    const response = await fetch(`${API_BASE_URL}/api/admin/products/${id}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.product || data;
  }

  async createProduct(productData: ProductData): Promise<ProductData> {
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
      return data.product || data;
    } catch (error) {
      console.error("Error creating product:", error);
      throw error;
    }
  }

  async updateProduct(
    id: number,
    productData: ProductData
  ): Promise<ProductData> {
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
      return data.product || data;
    } catch (error) {
      console.error("Error updating product:", error);
      throw error;
    }
  }

  async deleteProduct(id: number): Promise<void> {
    // Récupérer le token d'authentification depuis le localStorage
    const token =
      typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    if (!token) {
      throw new Error("Authentication token not found");
    }

    const response = await fetch(`${API_BASE_URL}/api/admin/products/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  }

  async createProductWithImages(
    productData: ProductData & { images: File[] }
  ): Promise<ProductData> {
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
      return data.product || data;
    } catch (error) {
      console.error("Error creating product with images:", error);
      throw error;
    }
  }

  async uploadImage(
    productId: number,
    image: File,
    options?: ImageUploadOptions
  ): Promise<ProductImageData> {
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
      if (options?.altText) formData.append("altText", options.altText);
      if (options?.description)
        formData.append("description", options.description);
      if (options?.orderIndex !== undefined)
        formData.append("orderIndex", options.orderIndex.toString());

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
      return data.image || data;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  }

  async activateProduct(id: number): Promise<ProductData> {
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
      return data.product || data;
    } catch (error) {
      console.error("Error activating product:", error);
      throw error;
    }
  }

  async deactivateProduct(id: number): Promise<ProductData> {
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
      return data.product || data;
    } catch (error) {
      console.error("Error deactivating product:", error);
      throw error;
    }
  }

  // ===========================================
  // CATEGORY METHODS
  // ===========================================

  async getCategories(): Promise<CategoryData[]> {
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
      return data;
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }
  }

  async getCategory(id: number): Promise<CategoryData> {
    // Récupérer le token d'authentification depuis le localStorage
    const token =
      typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    if (!token) {
      throw new Error("Authentication token not found");
    }

    const response = await fetch(`${API_BASE_URL}/api/admin/categories/${id}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.category || data;
  }

  async createCategory(categoryData: CategoryData): Promise<CategoryData> {
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
      return data.category || data;
    } catch (error) {
      console.error("Error creating category:", error);
      throw error;
    }
  }

  async updateCategory(
    id: number,
    categoryData: CategoryData
  ): Promise<CategoryData> {
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
      return data.category || data;
    } catch (error) {
      console.error("Error updating category:", error);
      throw error;
    }
  }

  async deleteCategory(id: number): Promise<void> {
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
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 409) {
          const customError = new Error("CATEGORY_HAS_PRODUCTS");
          (customError as any).status = 409;
          throw customError;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
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

  async deleteImage(productId: number, imageId: number): Promise<void> {
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

      // Image deleted successfully
    } catch (error) {
      console.error("Error deleting image:", error);
      throw error;
    }
  }

  async addImagesToProduct(
    productId: number,
    images: File[]
  ): Promise<ProductData> {
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
      return data.product || data;
    } catch (error) {
      console.error("Error adding images to product:", error);
      throw error;
    }
  }
}

export const productService = new ProductService();
