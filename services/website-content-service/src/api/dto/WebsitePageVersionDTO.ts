/**
 * Website Page Version DTOs
 * Data transfer objects for website page version management
 *
 * Architecture : DTO pattern
 * - API request/response validation
 * - Data transformation
 * - Type safety
 */

/**
 * Website page version creation DTO
 */
export interface WebsitePageVersionCreateDTO {
  pageSlug: string;
  markdownContent: string;
}

/**
 * Website page version update DTO
 */
export interface WebsitePageVersionUpdateDTO {
  markdownContent?: string;
}

/**
 * Website page version public DTO (for API responses)
 */
export interface WebsitePageVersionPublicDTO {
  id: number | null;
  pageId: number | null;
  versionNumber: number;
  markdownContent: string;
  htmlContent: string;
  createdAt: Date | null;
}

/**
 * Website page version list DTO
 */
export interface WebsitePageVersionListDTO {
  versions: WebsitePageVersionPublicDTO[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
