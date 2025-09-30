/**
 * WebsitePageVersion Model
 * Represents a version of a website page
 *
 * Architecture : Model pattern
 * - Business logic encapsulation
 * - Data validation
 * - Type safety
 */

export interface WebsitePageVersionData {
  version_id: number | null;
  parent_page_id: number;
  markdown_content: string;
  html_content: string | null;
  version: number;
  creation_timestamp: Date | null;
}

export default class WebsitePageVersion {
  public readonly id: number | null;
  public readonly pageId: number;
  public readonly markdownContent: string;
  public readonly htmlContent: string | null;
  public readonly versionNumber: number;
  public readonly createdAt: Date | null;

  constructor(data: WebsitePageVersionData) {
    this.id = data.version_id;
    this.pageId = data.parent_page_id;
    this.markdownContent = data.markdown_content;
    this.htmlContent = data.html_content;
    this.versionNumber = data.version;
    this.createdAt = data.creation_timestamp;
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

    if (!this.pageId || this.pageId <= 0) {
      errors.push("Page ID is required");
    }

    if (!this.markdownContent || this.markdownContent.trim().length === 0) {
      errors.push("Markdown content is required");
    }

    if (!this.versionNumber || this.versionNumber <= 0) {
      errors.push("Version number must be greater than 0");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Check if the version is valid
   * @returns {boolean} True if valid
   */
  isValid(): boolean {
    return this.validate().isValid;
  }
}
