/**
 * WebsitePage ORM Entity
 * Represents a website page with versioning support
 */
class WebsitePage {
  constructor(data = {}) {
    this.pageId = data.pageId || null;
    this.pageSlug = data.pageSlug || "";
    this.pageTitle = data.pageTitle || "";
    this.markdownContent = data.markdownContent || "";
    this.htmlContent = data.htmlContent || "";
    this.version = data.version || 1;
    this.creationTimestamp = data.creationTimestamp || null;
    this.lastUpdateTimestamp = data.lastUpdateTimestamp || null;
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
   * Get the active version of this page
   * @returns {WebsitePageVersion|null} Active version
   */
  getActiveVersion() {
    // This would typically query the database for the active version
    // For now, return null as this is handled by the repository
    return null;
  }

  /**
   * Convert entity to database row format
   * @returns {Object} Database row
   */
  toDbRow() {
    return {
      page_id: this.pageId,
      page_slug: this.pageSlug,
      page_title: this.pageTitle,
      markdown_content: this.markdownContent,
      html_content: this.htmlContent,
      version: this.version,
      creation_timestamp: this.creationTimestamp,
      last_update_timestamp: this.lastUpdateTimestamp,
    };
  }

  /**
   * Create entity from database row
   * @param {Object} row Database row
   * @returns {WebsitePage} WebsitePage instance
   */
  static fromDbRow(row) {
    return new WebsitePage({
      pageId: row.page_id,
      pageSlug: row.page_slug,
      pageTitle: row.page_title,
      markdownContent: row.markdown_content,
      htmlContent: row.html_content,
      version: row.version,
      creationTimestamp: row.creation_timestamp,
      lastUpdateTimestamp: row.last_update_timestamp,
    });
  }

  /**
   * Validate entity data
   * @returns {Object} Validation result
   */
  validate() {
    const errors = [];

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

module.exports = WebsitePage;
