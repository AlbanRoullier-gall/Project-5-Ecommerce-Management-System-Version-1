/**
 * DTO Frontend - Import des types partagés
 */

// Réexportation de tous les types partagés
// Use relative path like backend services do
// In Docker: shared-types is at /app/shared-types, dto is at /app/dto, so ../shared-types works
// In local dev: shared-types is at root, dto is at frontend/dto, so ../../../shared-types works
// We use ../shared-types for Docker (which is the build context)
// Try with explicit extension
export * from "../shared-types/index";
