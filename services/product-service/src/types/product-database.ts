import { Request } from "express";

/**
 * Types spécifiques à la base de données du service product
 * Types uniques qui ne sont pas dans shared-types
 */

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
