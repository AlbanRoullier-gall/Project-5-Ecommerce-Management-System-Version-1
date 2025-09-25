export interface AuthenticatedRequest {
  user: {
    customerId: number;
    email: string;
    role: string;
  };
  headers: { [key: string]: string | string[] | undefined };
  params: { [key: string]: string };
  body: any;
}

export interface CartItem {
  productId: number;
  name: string;
  unitPriceHT: number;
  vatRate: number;
  quantity: number;
  image?: string | null;
}

export interface CartTotals {
  totalHT: number;
  totalTTC: number;
  totalVAT: number;
}

export interface Cart {
  items: CartItem[];
  totals: CartTotals;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  vat_rate: number;
  is_active: boolean;
  images?: Array<{
    file_path: string;
  }>;
}

export interface CartItemRequest {
  productId: number;
  quantity: number;
}

export interface OrderItem {
  productId: number;
  quantity: number;
  unitPriceHT: number;
  vatRate: number;
}

export interface OrderData {
  customerId: number;
  items: OrderItem[];
  totals: CartTotals;
}
