/**
 * Order List DTOs
 * Data Transfer Objects for order listing and filtering
 *
 * Architecture : DTO pattern
 * - Input validation
 * - API contract definition
 * - Data transformation
 */

export interface OrderListOptions {
  page?: number;
  limit?: number;
  search?: string;
  customerId?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
  sort?: string;
}

export interface OrderListResponse {
  orders: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface OrderListRequest {
  page?: number;
  limit?: number;
  search?: string;
  customerId?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
  sort?: string;
}