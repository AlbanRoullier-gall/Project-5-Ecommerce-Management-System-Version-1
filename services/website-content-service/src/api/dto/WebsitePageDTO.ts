/**
 * Website Page DTOs
 * Data transfer objects for website page management
 *
 * Architecture : DTO pattern
 * - API request/response validation
 * - Data transformation
 * - Type safety
 */

import { SortBy, SortOrder } from "../../types/Enums";

/**
 * Website page creation DTO
 */
export interface WebsitePageCreateDTO {
  pageSlug: string;
  pageTitle: string;
  markdownContent: string;
  htmlContent?: string;
}

/**
 * Website page update DTO
 */
export interface WebsitePageUpdateDTO {
  pageSlug?: string;
  pageTitle?: string;
  markdownContent?: string;
  htmlContent?: string;
}

/**
 * Website page public DTO (for API responses)
 */
export interface WebsitePagePublicDTO {
  id: number;
  pageSlug: string;
  pageTitle: string;
  markdownContent: string;
  htmlContent: string | null;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Website page list options DTO
 */
export interface WebsitePageListOptions {
  page: number;
  limit: number;
  search?: string;
  sortBy?: SortBy;
  sortOrder?: SortOrder;
}
