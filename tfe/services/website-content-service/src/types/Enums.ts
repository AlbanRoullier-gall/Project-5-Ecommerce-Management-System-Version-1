/**
 * Enums for Website Content Service
 * Constrained values for type safety and consistency
 */

/**
 * Page status values
 */
export enum PageStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
  ARCHIVED = "archived",
}

/**
 * Content type values
 */
export enum ContentType {
  MARKDOWN = "markdown",
  HTML = "html",
  MIXED = "mixed",
}

/**
 * Sort options for website pages
 */
export enum SortBy {
  CREATED_AT = "creation_timestamp",
  UPDATED_AT = "last_update_timestamp",
  TITLE = "page_title",
  SLUG = "page_slug",
  VERSION = "version",
}

/**
 * Sort order options
 */
export enum SortOrder {
  ASC = "asc",
  DESC = "desc",
}

/**
 * Version status options
 */
export enum VersionStatus {
  CURRENT = "current",
  PREVIOUS = "previous",
  ARCHIVED = "archived",
}
