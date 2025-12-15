/**
 * DTO Frontend - Import des types partagés
 */

// Réexportation de tous les types partagés
// In Docker: shared-types is at /app/shared-types, dto is at /app/dto, so ../shared-types works
// In local dev: shared-types is at root, dto is at frontend/dto, so ../../../shared-types works
// We use ../shared-types for Docker, but this won't work in local dev
// So we need to use the npm package @tfe/shared-types which works in both contexts
export * from "@tfe/shared-types";
