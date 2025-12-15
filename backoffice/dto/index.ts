/**
 * DTO Back-office - Import des types partagés
 */

// Réexportation de tous les types partagés
// Use relative path like backend services do
// In Docker: shared-types is at /app/shared-types, dto is at /app/dto, so ../shared-types works
// Try with explicit extension
export * from "../shared-types/index";
