import { Request } from "express";

/**
 * Types spécifiques à la base de données du service order
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
export interface OrderDbRow {
  id: number;
  customer_id: number;
  customer_snapshot: any;
  total_amount_ht: number;
  total_amount_ttc: number;
  payment_method: string;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface OrderItemDbRow {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  unit_price_ht: number;
  unit_price_ttc: number;
  vat_rate: number;
  total_price_ht: number;
  total_price_ttc: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreditNoteDbRow {
  id: number;
  customer_id: number;
  order_id: number;
  total_amount_ht: number;
  total_amount_ttc: number;
  reason: string;
  description: string | null;
  issue_date: Date;
  payment_method: string;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreditNoteItemDbRow {
  id: number;
  credit_note_id: number;
  product_id: number;
  quantity: number;
  unit_price_ht: number;
  unit_price_ttc: number;
  vat_rate: number;
  total_price_ht: number;
  total_price_ttc: number;
  created_at: Date;
  updated_at: Date;
}

export interface OrderAddressDbRow {
  id: number;
  order_id: number;
  type: string;
  address_snapshot: any;
  created_at: Date;
  updated_at: Date;
}
