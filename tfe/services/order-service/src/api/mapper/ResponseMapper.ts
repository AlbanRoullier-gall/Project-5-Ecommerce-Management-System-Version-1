/**
 * Response Mapper
 * Standardized API response formatting
 *
 * Architecture : Mapper pattern
 * - Consistent response structure
 * - Error handling
 * - Timestamp and status inclusion
 */

/**
 * Response Mapper for standardized API responses
 */
export class ResponseMapper {
  /**
   * Success response
   */
  static success<T>(data: T, message: string = "Success") {
    return {
      message,
      data,
      timestamp: new Date().toISOString(),
      status: 200,
    };
  }

  /**
   * Created response
   */
  static created<T>(data: T, message: string = "Created successfully") {
    return {
      message,
      data,
      timestamp: new Date().toISOString(),
      status: 201,
    };
  }

  /**
   * Order created response
   */
  static orderCreated(order: any) {
    return {
      message: "Order created successfully",
      order,
      timestamp: new Date().toISOString(),
      status: 201,
    };
  }

  /**
   * Order retrieved response
   */
  static orderRetrieved(order: any) {
    return {
      message: "Order retrieved successfully",
      order,
      timestamp: new Date().toISOString(),
      status: 200,
    };
  }

  /**
   * Order updated response
   */
  static orderUpdated(order: any) {
    return {
      message: "Order updated successfully",
      order,
      timestamp: new Date().toISOString(),
      status: 200,
    };
  }

  /**
   * Order deleted response
   */
  static orderDeleted() {
    return {
      message: "Order deleted successfully",
      timestamp: new Date().toISOString(),
      status: 200,
    };
  }

  /**
   * OrderItem created response
   */
  static orderItemCreated(orderItem: any) {
    return {
      message: "Order item created successfully",
      orderItem,
      timestamp: new Date().toISOString(),
      status: 201,
    };
  }

  /**
   * OrderItem retrieved response
   */
  static orderItemRetrieved(orderItem: any) {
    return {
      message: "Order item retrieved successfully",
      orderItem,
      timestamp: new Date().toISOString(),
      status: 200,
    };
  }

  /**
   * OrderItem updated response
   */
  static orderItemUpdated(orderItem: any) {
    return {
      message: "Order item updated successfully",
      orderItem,
      timestamp: new Date().toISOString(),
      status: 200,
    };
  }

  /**
   * OrderItem deleted response
   */
  static orderItemDeleted() {
    return {
      message: "Order item deleted successfully",
      timestamp: new Date().toISOString(),
      status: 200,
    };
  }

  /**
   * CreditNote created response
   */
  static creditNoteCreated(creditNote: any) {
    return {
      message: "Credit note created successfully",
      creditNote,
      timestamp: new Date().toISOString(),
      status: 201,
    };
  }

  /**
   * CreditNote retrieved response
   */
  static creditNoteRetrieved(creditNote: any) {
    return {
      message: "Credit note retrieved successfully",
      creditNote,
      timestamp: new Date().toISOString(),
      status: 200,
    };
  }

  /**
   * CreditNote updated response
   */
  static creditNoteUpdated(creditNote: any) {
    return {
      message: "Credit note updated successfully",
      creditNote,
      timestamp: new Date().toISOString(),
      status: 200,
    };
  }

  /**
   * CreditNote deleted response
   */
  static creditNoteDeleted() {
    return {
      message: "Credit note deleted successfully",
      timestamp: new Date().toISOString(),
      status: 200,
    };
  }

  /**
   * CreditNoteItem created response
   */
  static creditNoteItemCreated(creditNoteItem: any) {
    return {
      message: "Credit note item created successfully",
      creditNoteItem,
      timestamp: new Date().toISOString(),
      status: 201,
    };
  }

  /**
   * CreditNoteItem retrieved response
   */
  static creditNoteItemRetrieved(creditNoteItem: any) {
    return {
      message: "Credit note item retrieved successfully",
      creditNoteItem,
      timestamp: new Date().toISOString(),
      status: 200,
    };
  }

  /**
   * CreditNoteItem updated response
   */
  static creditNoteItemUpdated(creditNoteItem: any) {
    return {
      message: "Credit note item updated successfully",
      creditNoteItem,
      timestamp: new Date().toISOString(),
      status: 200,
    };
  }

  /**
   * CreditNoteItem deleted response
   */
  static creditNoteItemDeleted() {
    return {
      message: "Credit note item deleted successfully",
      timestamp: new Date().toISOString(),
      status: 200,
    };
  }

  /**
   * OrderAddress created response
   */
  static orderAddressCreated(address: any) {
    return {
      message: "Order address created successfully",
      address,
      timestamp: new Date().toISOString(),
      status: 201,
    };
  }

  /**
   * OrderAddress retrieved response
   */
  static orderAddressRetrieved(address: any) {
    return {
      message: "Order address retrieved successfully",
      address,
      timestamp: new Date().toISOString(),
      status: 200,
    };
  }

  /**
   * OrderAddress updated response
   */
  static orderAddressUpdated(address: any) {
    return {
      message: "Order address updated successfully",
      address,
      timestamp: new Date().toISOString(),
      status: 200,
    };
  }

  /**
   * OrderAddress deleted response
   */
  static orderAddressDeleted() {
    return {
      message: "Order address deleted successfully",
      timestamp: new Date().toISOString(),
      status: 200,
    };
  }

  /**
   * Order statistics retrieved response
   */
  static orderStatisticsRetrieved(statistics: any) {
    return {
      message: "Order statistics retrieved successfully",
      statistics,
      timestamp: new Date().toISOString(),
      status: 200,
    };
  }

  /**
   * Validation error response
   */
  static validationError(message: string) {
    return {
      message,
      timestamp: new Date().toISOString(),
      status: 400,
    };
  }

  /**
   * Not found error response
   */
  static notFoundError(resource: string) {
    return {
      message: `${resource} not found`,
      timestamp: new Date().toISOString(),
      status: 404,
    };
  }

  /**
   * Conflict error response
   */
  static conflictError(message: string) {
    return {
      message,
      timestamp: new Date().toISOString(),
      status: 409,
    };
  }

  /**
   * Internal server error response
   */
  static internalServerError() {
    return {
      message: "Internal server error",
      timestamp: new Date().toISOString(),
      status: 500,
    };
  }

  /**
   * Unauthorized error response
   */
  static unauthorizedError(message: string = "Unauthorized") {
    return {
      message,
      timestamp: new Date().toISOString(),
      status: 401,
    };
  }

  /**
   * Forbidden error response
   */
  static forbiddenError(message: string = "Forbidden") {
    return {
      message,
      timestamp: new Date().toISOString(),
      status: 403,
    };
  }

  /**
   * Bad request error response
   */
  static badRequestError(message: string = "Bad request") {
    return {
      message,
      timestamp: new Date().toISOString(),
      status: 400,
    };
  }

  /**
   * Method not allowed error response
   */
  static methodNotAllowedError(message: string = "Method not allowed") {
    return {
      message,
      timestamp: new Date().toISOString(),
      status: 405,
    };
  }

  /**
   * Request timeout error response
   */
  static timeoutError(message: string = "Request timeout") {
    return {
      message,
      timestamp: new Date().toISOString(),
      status: 408,
    };
  }

  /**
   * Service unavailable error response
   */
  static serviceUnavailableError(message: string = "Service unavailable") {
    return {
      message,
      timestamp: new Date().toISOString(),
      status: 503,
    };
  }

  /**
   * Gateway timeout error response
   */
  static gatewayTimeoutError(message: string = "Gateway timeout") {
    return {
      message,
      timestamp: new Date().toISOString(),
      status: 504,
    };
  }

  /**
   * Health check success response
   */
  static healthSuccess() {
    return {
      status: "healthy",
      timestamp: new Date().toISOString(),
      service: "order-service",
    };
  }

  /**
   * Health check error response
   */
  static healthError() {
    return {
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      service: "order-service",
      error: "Service unavailable",
    };
  }

  /**
   * Generic error response
   */
  static error(message: string, status: number = 500) {
    return {
      message,
      timestamp: new Date().toISOString(),
      status,
    };
  }
}
