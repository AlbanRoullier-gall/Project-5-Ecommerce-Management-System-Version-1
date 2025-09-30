/**
 * WebsitePage Model
 * Represents a website page with versioning support
 *
 * Architecture : Model pattern
 * - Business logic encapsulation
 * - Data validation
 * - Type safety
 */

export interface WebsitePageData {
  page_id: number | null;
  page_slug: string;
  page_title: string;
  markdown_content: string;
  html_content: string | null;
  version: number;
  creation_timestamp: Date | null;
  last_update_timestamp: Date | null;
}

export default class WebsitePage {
  public readonly id: number | null;
  public readonly pageSlug: string;
  public readonly pageTitle: string;
  public readonly markdownContent: string;
  public readonly htmlContent: string | null;
  public readonly version: number;
  public readonly createdAt: Date | null;
  public readonly updatedAt: Date | null;

  constructor(data: WebsitePageData) {
    this.id = data.page_id;
    this.pageSlug = data.page_slug;
    this.pageTitle = data.page_title;
    this.markdownContent = data.markdown_content;
    this.htmlContent = data.html_content;
    this.version = data.version;
    this.createdAt = data.creation_timestamp;
    this.updatedAt = data.last_update_timestamp;
  }

  /**
   * Render markdown content to HTML
   * @returns {string} HTML content
   */
  renderHtml(): string {
    if (!this.markdownContent) return "";

    // Simple markdown to HTML conversion
    // In production, use a proper markdown library like marked
    return this.markdownContent
      .replace(/^# (.*$)/gim, "<h1>$1</h1>")
      .replace(/^## (.*$)/gim, "<h2>$1</h2>")
      .replace(/^### (.*$)/gim, "<h3>$1</h3>")
      .replace(/\*\*(.*?)\*\*/gim, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/gim, "<em>$1</em>")
      .replace(/\n/gim, "<br>");
  }

  /**
   * Validate entity data
   * @returns {Object} Validation result
   */
  validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.pageSlug || this.pageSlug.trim().length === 0) {
      errors.push("Page slug is required");
    }

    if (!this.pageTitle || this.pageTitle.trim().length === 0) {
      errors.push("Page title is required");
    }

    if (!this.markdownContent || this.markdownContent.trim().length === 0) {
      errors.push("Markdown content is required");
    }

    if (this.pageSlug && !/^[a-z0-9-]+$/.test(this.pageSlug)) {
      errors.push(
        "Page slug must contain only lowercase letters, numbers, and hyphens"
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Check if the page is valid
   * @returns {boolean} True if valid
   */
  isValid(): boolean {
    return this.validate().isValid;
  }
}
