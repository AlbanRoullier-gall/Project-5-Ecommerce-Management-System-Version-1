/**
 * Index principal des types partagés
 * Exporte tous les DTOs de tous les services
 */

// Export des types communs
export * from "./common/BaseItemDTO";

// Export des DTOs par service
export * from "./auth-service";
export * from "./cart-service";
export * from "./customer-service";
export * from "./email-service";
export * from "./order-service";
export * from "./payment-service";
export * from "./product-service";
