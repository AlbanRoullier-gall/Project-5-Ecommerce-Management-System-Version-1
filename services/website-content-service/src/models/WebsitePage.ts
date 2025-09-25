import { WebsitePageData, WebsitePageDbRow } from "../types";

/**
 * WebsitePage ORM Entity
 * Represents a website page with versioning support
 */
export default class WebsitePage {
  public pageId: number | null;
  public pageSlug: string;
  public pageTitle: string;
  public markdownContent: string;
  public htmlContent: string;
  public version: number;
  public creationTimestamp: Date | null;
  public lastUpdateTimestamp: Date | null;

  constructor(data: WebsitePageData = {} as WebsitePageData) {
    this.pageId = data.id ?? null;
    this.pageSlug = data.pageSlug ?? "";
    this.pageTitle = data.pageTitle ?? "";
    this.markdownContent = data.markdownContent ?? "";
    this.htmlContent = data.htmlContent ?? "";
    this.version = 1;
    this.creationTimestamp = data.createdAt ?? null;
    this.lastUpdateTimestamp = data.updatedAt ?? null;
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
   * Get the active version of this page
   * @returns {WebsitePageVersion|null} Active version
   */
  getActiveVersion(): any {
    // This would typically query the database for the active version
    // For now, return null as this is handled by the repository
    return null;
  }

  /**
   * Convert entity to database row format
   * @returns {Object} Database row
   */
  toDbRow(): WebsitePageDbRow {
    return {
      id: this.pageId!,
      page_slug: this.pageSlug,
      page_title: this.pageTitle,
      markdown_content: this.markdownContent,
      html_content: this.htmlContent,
      created_at: this.creationTimestamp!,
      updated_at: this.lastUpdateTimestamp!,
    };
  }

  /**
   * Create entity from database row
   * @param {Object} row Database row
   * @returns {WebsitePage} WebsitePage instance
   */
  static fromDbRow(row: WebsitePageDbRow): WebsitePage {
    return new WebsitePage({
      id: row.id,
      pageSlug: row.page_slug,
      pageTitle: row.page_title,
      markdownContent: row.markdown_content,
      htmlContent: row.html_content,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
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
}
