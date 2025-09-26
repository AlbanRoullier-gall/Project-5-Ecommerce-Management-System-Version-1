/**
 * Types spécifiques à la base de données du service cart
 * Types uniques qui ne sont pas dans shared-types
 */

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

// Note: OrderData dans cart-service est différent de celui dans shared-types
export interface OrderData {
  customerId: number;
  items: OrderItem[];
  totals: CartTotals;
}
