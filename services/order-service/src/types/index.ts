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

export interface OrderData {
  id?: number;
  customerId: number;
  customerSnapshot: any;
  totalAmountHT: number;
  totalAmountTTC: number;
  paymentMethod: string;
  notes?: string;
  items?: OrderItemData[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface OrderItemData {
  id?: number;
  orderId?: number;
  productId: number;
  quantity: number;
  unitPriceHT: number;
  unitPriceTTC: number;
  vatRate: number;
  totalPriceHT: number;
  totalPriceTTC: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface OrderUpdateData {
  customerId?: number;
  customerSnapshot?: any;
  totalAmountHT?: number;
  totalAmountTTC?: number;
  paymentMethod?: string;
  notes?: string;
  items?: OrderItemData[];
}

export interface CreditNoteData {
  id?: number;
  customerId: number;
  orderId: number;
  totalAmountHT: number;
  totalAmountTTC: number;
  reason: string;
  description?: string;
  issueDate: Date;
  paymentMethod: string;
  notes?: string;
  items?: CreditNoteItemData[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreditNoteItemData {
  id?: number;
  creditNoteId?: number;
  productId: number;
  quantity: number;
  unitPriceHT: number;
  unitPriceTTC: number;
  vatRate: number;
  totalPriceHT: number;
  totalPriceTTC: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface OrderAddressData {
  id?: number;
  orderId: number;
  type: "shipping" | "billing";
  addressSnapshot: any;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface OrderListOptions {
  page?: number;
  limit?: number;
  customerId?: number;
  status?: string;
  sort?: string;
  startDate?: string;
  endDate?: string;
}

export interface OrderListResult {
  orders: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface OrderStatistics {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  ordersByStatus: { [key: string]: number };
  revenueByPeriod: { [key: string]: number };
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
