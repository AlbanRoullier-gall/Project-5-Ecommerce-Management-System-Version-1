/**
 * WebsitePageVersion ORM Entity
 * Represents a version of a website page
 */
class WebsitePageVersion {
  constructor(data = {}) {
    this.versionId = data.versionId || null;
    this.parentPageId = data.parentPageId || null;
    this.markdownContent = data.markdownContent || "";
    this.htmlContent = data.htmlContent || "";
    this.versionNumber = data.versionNumber || 1;
    this.creationTimestamp = data.creationTimestamp || null;
  }

  /**
   * Render markdown content to HTML
   * @returns {string} HTML content
   */
  renderHtml() {
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
  rollback() {
    // This would typically be handled by the service layer
    // The actual rollback logic is implemented in WebsiteContentService
    throw new Error("Rollback should be handled by the service layer");
  }

  /**
   * Convert entity to database row format
   * @returns {Object} Database row
   */
  toDbRow() {
    return {
      version_id: this.versionId,
      parent_page_id: this.parentPageId,
      markdown_content: this.markdownContent,
      html_content: this.htmlContent,
      version: this.versionNumber,
      creation_timestamp: this.creationTimestamp,
    };
  }

  /**
   * Create entity from database row
   * @param {Object} row Database row
   * @returns {WebsitePageVersion} WebsitePageVersion instance
   */
  static fromDbRow(row) {
    return new WebsitePageVersion({
      versionId: row.version_id,
      parentPageId: row.parent_page_id,
      markdownContent: row.markdown_content,
      htmlContent: row.html_content,
      versionNumber: row.version,
      creationTimestamp: row.creation_timestamp,
    });
  }

  /**
   * Validate entity data
   * @returns {Object} Validation result
   */
  validate() {
    const errors = [];

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

module.exports = WebsitePageVersion;
