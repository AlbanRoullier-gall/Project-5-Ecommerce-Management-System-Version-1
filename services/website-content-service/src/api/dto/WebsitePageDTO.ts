/**
 * Website Page DTOs
 * Data transfer objects for website page management
 *
 * Architecture : DTO pattern
 * - API request/response validation
 * - Data transformation
 * - Type safety
 */

/**
 * Website page creation DTO
 */
export interface WebsitePageCreateDTO {
  pageSlug: string;
  pageTitle: string;
  markdownContent: string;
}

/**
 * Website page update DTO
 */
export interface WebsitePageUpdateDTO {
  pageSlug?: string;
  pageTitle?: string;
  markdownContent?: string;
}

/**
 * Website page public DTO (for API responses)
 */
export interface WebsitePagePublicDTO {
  id: number | null;
  pageSlug: string;
  pageTitle: string;
  markdownContent: string;
  htmlContent: string;
  version: number;
  createdAt: Date | null;
  updatedAt: Date | null;
}

/**
 * Website page list options DTO
 */
export interface WebsitePageListOptions {
  page: number;
  limit: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
