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
  pageId: number;
  markdownContent: string;
  version: number;
}

/**
 * Website page version update DTO
 */
export interface WebsitePageVersionUpdateDTO {
  markdownContent?: string;
  htmlContent?: string;
  version?: number;
}

/**
 * Website page version public DTO (for API responses)
 */
export interface WebsitePageVersionPublicDTO {
  id: number;
  pageId: number;
  versionNumber: number;
  markdownContent: string;
  htmlContent: string | null;
  createdAt: Date;
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
