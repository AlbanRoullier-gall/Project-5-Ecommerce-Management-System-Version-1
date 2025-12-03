/**
 * Index des services
 * Facilite l'import des services
 */

export { apiClient } from "./apiClient";
export type { ApiRequestOptions, ApiResponse } from "./apiClient";

export * from "./productService";
export * from "./contactService";
export * from "./paymentService";
export * from "./cartService";
export * from "./checkoutService";
export { logger } from "./logger";
