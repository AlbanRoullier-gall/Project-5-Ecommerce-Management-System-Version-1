/**
 * OrderStatistics DTOs
 * Data transfer objects for order statistics
 *
 * Architecture : DTO pattern
 * - API request/response validation
 * - Data transformation
 * - Type safety
 */

/**
 * Order statistics request DTO
 */
export interface OrderStatisticsRequestDTO {
  startDate?: string;
  endDate?: string;
  customerId?: number | undefined;
  status?: string;
}

/**
 * Order statistics response DTO
 */
export interface OrderStatisticsResponseDTO {
  totalOrders: number;
  totalAmount: number;
  averageOrderValue: number;
  ordersByStatus: Record<string, number>;
  ordersByMonth: Record<string, number>;
  topCustomers: Array<{
    customerId: number;
    customerName: string;
    totalOrders: number;
    totalAmount: number;
  }>;
  orders: Array<{
    id: number;
    customerId: number;
    totalAmountTTC: number;
    paymentMethod: string;
    createdAt: Date;
  }>;
}
