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

export interface PaymentIntentData {
  orderId: number;
  amount: number;
  currency: string;
  paymentMethod: string;
}

export interface ConfirmPaymentData {
  paymentIntentId: string;
  paymentMethodId?: string;
}

export interface PaymentIntentResponse {
  id: number;
  stripePaymentIntentId: string;
  amount: number;
  currency: string;
  status: string;
  clientSecret: string;
  createdAt: Date;
}

export interface PaymentStatusResponse {
  id: number;
  stripePaymentIntentId: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentListResponse {
  payments: PaymentStatusResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Database row types
export interface PaymentIntentDbRow {
  id: number;
  stripe_payment_intent_id: string;
  customer_id: number;
  order_id: number;
  amount: number;
  currency: string;
  status: string;
  created_at: Date;
  updated_at: Date;
}
