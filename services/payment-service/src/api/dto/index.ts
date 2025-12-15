/**
 * Index des DTOs
 * Exporte tous les DTOs depuis shared-types
 */

// Réexport des DTOs depuis shared-types
// Dans Docker : shared-types est à la racine /app, donc ../../../ depuis src/api/dto
export * from "../../../shared-types/payment-service";
