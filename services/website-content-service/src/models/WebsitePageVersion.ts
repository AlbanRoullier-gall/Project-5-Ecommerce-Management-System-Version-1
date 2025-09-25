import { WebsitePageVersionData, WebsitePageVersionDbRow } from "../types";

/**
 * WebsitePageVersion ORM Entity
 * Represents a version of a website page
 */
export default class WebsitePageVersion {
  public versionId: number | null;
  public parentPageId: number | null;
  public markdownContent: string;
  public htmlContent: string;
  public versionNumber: number;
  public creationTimestamp: Date | null;

  constructor(data: WebsitePageVersionData = {} as WebsitePageVersionData) {
    this.versionId = data.id ?? null;
    this.parentPageId = data.pageId ?? null;
    this.markdownContent = data.markdownContent ?? "";
    this.htmlContent = data.htmlContent ?? "";
    this.versionNumber = data.versionNumber ?? 1;
    this.creationTimestamp = data.createdAt ?? null;
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
   * Rollback to this version
   * This method would typically update the parent page to this version
   * @returns {void}
   */
  rollback(): void {
    // This would typically be handled by the service layer
    // The actual rollback logic is implemented in WebsiteContentService
    throw new Error("Rollback should be handled by the service layer");
  }

  /**
   * Convert entity to database row format
   * @returns {Object} Database row
   */
  toDbRow(): WebsitePageVersionDbRow {
    return {
      id: this.versionId!,
      page_id: this.parentPageId!,
      version_number: this.versionNumber,
      markdown_content: this.markdownContent,
      html_content: this.htmlContent,
      created_at: this.creationTimestamp!,
    };
  }

  /**
   * Create entity from database row
   * @param {Object} row Database row
   * @returns {WebsitePageVersion} WebsitePageVersion instance
   */
  static fromDbRow(row: WebsitePageVersionDbRow): WebsitePageVersion {
    return new WebsitePageVersion({
      id: row.id,
      pageId: row.page_id,
      markdownContent: row.markdown_content,
      htmlContent: row.html_content,
      versionNumber: row.version_number,
      createdAt: row.created_at,
    });
  }

  /**
   * Validate entity data
   * @returns {Object} Validation result
   */
  validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.parentPageId) {
      errors.push("Parent page ID is required");
    }

    if (!this.markdownContent || this.markdownContent.trim().length === 0) {
      errors.push("Markdown content is required");
    }

    if (!this.versionNumber || this.versionNumber < 1) {
      errors.push("Version number must be a positive integer");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
