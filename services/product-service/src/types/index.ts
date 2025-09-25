import { Request } from "express";

export interface AuthenticatedRequest extends Request {
  user: {
    customerId: number;
    email: string;
    role: string;
  };
  headers: { [key: string]: string | string[] | undefined };
  params: { [key: string]: string };
  body: any;
}

export interface ProductData {
  id?: number;
  name: string;
  description?: string;
  price: number;
  vatRate: number;
  categoryId: number;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProductUpdateData {
  name?: string;
  description?: string;
  price?: number;
  vatRate?: number;
  categoryId?: number;
  isActive?: boolean;
}

export interface CategoryData {
  id?: number;
  name: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CategoryUpdateData {
  name?: string;
  description?: string;
}

export interface ProductImageData {
  id?: number;
  productId: number;
  filename: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  width: number;
  height: number;
  altText?: string;
  description?: string;
  isActive?: boolean;
  orderIndex?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProductImageUpdateData {
  altText?: string;
  description?: string;
  isActive?: boolean;
  orderIndex?: number;
}

export interface ProductListOptions {
  page?: number;
  limit?: number;
  categoryId?: number;
  search?: string;
  activeOnly?: boolean;
}

export interface ProductListResult {
  products: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ImageUploadOptions {
  altText?: string;
  description?: string;
  orderIndex?: number;
}

// Database row types
export interface ProductDbRow {
  id: number;
  name: string;
  description: string;
  price: number;
  vat_rate: number;
  category_id: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CategoryDbRow {
  id: number;
  name: string;
  description: string;
  created_at: Date;
  updated_at: Date;
}

export interface ProductImageDbRow {
  id: number;
  product_id: number;
  filename: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  width: number;
  height: number;
  alt_text: string;
  description: string;
  is_active: boolean;
  order_index: number;
  created_at: Date;
  updated_at: Date;
}
