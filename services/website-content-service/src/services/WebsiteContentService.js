/**
 * WebsiteContentService
 * Business logic layer for website content management
 */
const WebsitePage = require("../models/WebsitePage");
const WebsitePageVersion = require("../models/WebsitePageVersion");
const WebsitePageRepository = require("../repositories/WebsitePageRepository");
const WebsitePageVersionRepository = require("../repositories/WebsitePageVersionRepository");
const { marked } = require("marked");

class WebsiteContentService {
  constructor(pool) {
    this.pageRepository = new WebsitePageRepository(pool);
    this.versionRepository = new WebsitePageVersionRepository(pool);
  }

  /**
   * Format markdown content to HTML
   * @param {string} markdown Markdown content
   * @returns {string} HTML content
   */
  formatMarkdownToHtml(markdown) {
    if (!markdown) return "";

    try {
      // Configure marked options
      marked.setOptions({
        breaks: true,
        gfm: true,
      });

      return marked(markdown);
    } catch (error) {
      console.error("Error formatting markdown to HTML:", error);
      // Fallback to simple conversion
      return markdown
        .replace(/^# (.*$)/gim, "<h1>$1</h1>")
        .replace(/^## (.*$)/gim, "<h2>$1</h2>")
        .replace(/^### (.*$)/gim, "<h3>$1</h3>")
        .replace(/\*\*(.*?)\*\*/gim, "<strong>$1</strong>")
        .replace(/\*(.*?)\*/gim, "<em>$1</em>")
        .replace(/\n/gim, "<br>");
    }
  }

  /**
   * Create a new page
   * @param {string} title Page title
   * @param {string} slug Page slug
   * @param {string} markdown Markdown content
   * @returns {Promise<WebsitePage>} Created page
   */
  async createPage(title, slug, markdown) {
    try {
      // Check if slug already exists
      const existingPage = await this.pageRepository.getBySlug(slug);
      if (existingPage) {
        throw new Error("Page with this slug already exists");
      }

      // Format markdown to HTML
      const htmlContent = this.formatMarkdownToHtml(markdown);

      // Create page entity
      const page = new WebsitePage({
        pageSlug: slug,
        pageTitle: title,
        markdownContent: markdown,
        htmlContent: htmlContent,
        version: 1,
      });

      // Validate page
      const validation = page.validate();
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
      }

      // Save page
      const savedPage = await this.pageRepository.save(page);

      // Create initial version
      const version = new WebsitePageVersion({
        parentPageId: savedPage.pageId,
        markdownContent: markdown,
        htmlContent: htmlContent,
        versionNumber: 1,
      });

      await this.versionRepository.save(version);

      return savedPage;
    } catch (error) {
      console.error("Error creating page:", error);
      throw error;
    }
  }

  /**
   * Get page by slug
   * @param {string} slug Page slug
   * @returns {Promise<WebsitePage|null>} Page or null if not found
   */
  async getPageBySlug(slug) {
    try {
      return await this.pageRepository.getBySlug(slug);
    } catch (error) {
      console.error("Error getting page by slug:", error);
      throw error;
    }
  }

  /**
   * Get all page slugs
   * @returns {Promise<string[]>} Array of page slugs
   */
  async getAllPageSlugs() {
    try {
      return await this.pageRepository.listAllSlugs();
    } catch (error) {
      console.error("Error getting all page slugs:", error);
      throw error;
    }
  }

  /**
   * Update page
   * @param {string} slug Current page slug
   * @param {Object} updateData Update data
   * @returns {Promise<WebsitePage>} Updated page
   */
  async updatePage(slug, updateData) {
    try {
      const { pageSlug, pageTitle, markdownContent } = updateData;

      // Get current page
      const currentPage = await this.pageRepository.getBySlug(slug);
      if (!currentPage) {
        throw new Error("Page not found");
      }

      // Check if new slug conflicts with existing pages
      if (pageSlug && pageSlug !== slug) {
        const slugExists = await this.pageRepository.slugExists(
          pageSlug,
          currentPage.pageId
        );
        if (slugExists) {
          throw new Error("Page with this slug already exists");
        }
      }

      // Format markdown to HTML if content is updated
      let htmlContent = currentPage.htmlContent;
      if (markdownContent) {
        htmlContent = this.formatMarkdownToHtml(markdownContent);
      }

      // Create updated page entity
      const updatedPage = new WebsitePage({
        pageId: currentPage.pageId,
        pageSlug: pageSlug || currentPage.pageSlug,
        pageTitle: pageTitle || currentPage.pageTitle,
        markdownContent: markdownContent || currentPage.markdownContent,
        htmlContent: htmlContent,
        version: currentPage.version + 1,
        creationTimestamp: currentPage.creationTimestamp,
        lastUpdateTimestamp: currentPage.lastUpdateTimestamp,
      });

      // Validate updated page
      const validation = updatedPage.validate();
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
      }

      // Update page
      const savedPage = await this.pageRepository.update(updatedPage);

      // Create new version if content was updated
      if (markdownContent) {
        const version = new WebsitePageVersion({
          parentPageId: savedPage.pageId,
          markdownContent: markdownContent,
          htmlContent: htmlContent,
          versionNumber: savedPage.version,
        });

        await this.versionRepository.save(version);
      }

      return savedPage;
    } catch (error) {
      console.error("Error updating page:", error);
      throw error;
    }
  }

  /**
   * Delete page
   * @param {string} slug Page slug
   * @returns {Promise<boolean>} True if deleted successfully
   */
  async deletePage(slug) {
    try {
      const page = await this.pageRepository.getBySlug(slug);
      if (!page) {
        throw new Error("Page not found");
      }

      // Delete all versions first
      const versions = await this.versionRepository.listByPage(page.pageId);
      for (const version of versions) {
        await this.versionRepository.delete(version);
      }

      // Delete page
      return await this.pageRepository.delete(page);
    } catch (error) {
      console.error("Error deleting page:", error);
      throw error;
    }
  }

  /**
   * List versions for a page
   * @param {string} slug Page slug
   * @returns {Promise<WebsitePageVersion[]>} Array of versions
   */
  async listVersions(slug) {
    try {
      const page = await this.pageRepository.getBySlug(slug);
      if (!page) {
        throw new Error("Page not found");
      }

      return await this.versionRepository.listByPage(page.pageId);
    } catch (error) {
      console.error("Error listing versions:", error);
      throw error;
    }
  }

  /**
   * Rollback page to specific version
   * @param {string} slug Page slug
   * @param {number} versionNumber Version number to rollback to
   * @returns {Promise<WebsitePage>} Rolled back page
   */
  async rollbackPage(slug, versionNumber) {
    try {
      const page = await this.pageRepository.getBySlug(slug);
      if (!page) {
        throw new Error("Page not found");
      }

      // Get the version to rollback to
      const version = await this.versionRepository.getByPageAndVersion(
        page.pageId,
        versionNumber
      );
      if (!version) {
        throw new Error("Version not found");
      }

      // Create new version with rollback content
      const rollbackVersion = new WebsitePageVersion({
        parentPageId: page.pageId,
        markdownContent: version.markdownContent,
        htmlContent: version.htmlContent,
        versionNumber: page.version + 1,
      });

      await this.versionRepository.save(rollbackVersion);

      // Update page with rollback content
      const updatedPage = new WebsitePage({
        pageId: page.pageId,
        pageSlug: page.pageSlug,
        pageTitle: page.pageTitle,
        markdownContent: version.markdownContent,
        htmlContent: version.htmlContent,
        version: rollbackVersion.versionNumber,
        creationTimestamp: page.creationTimestamp,
        lastUpdateTimestamp: page.lastUpdateTimestamp,
      });

      return await this.pageRepository.update(updatedPage);
    } catch (error) {
      console.error("Error rolling back page:", error);
      throw error;
    }
  }

  /**
   * Delete specific version
   * @param {string} slug Page slug
   * @param {number} versionNumber Version number to delete
   * @returns {Promise<boolean>} True if deleted successfully
   */
  async deleteVersion(slug, versionNumber) {
    try {
      const page = await this.pageRepository.getBySlug(slug);
      if (!page) {
        throw new Error("Page not found");
      }

      // Check if version exists
      const versionExists = await this.versionRepository.versionExists(
        page.pageId,
        versionNumber
      );
      if (!versionExists) {
        throw new Error("Version not found");
      }

      // Don't allow deletion of the current version
      if (versionNumber === page.version) {
        throw new Error("Cannot delete the current version");
      }

      return await this.versionRepository.deleteByPageAndVersion(
        page.pageId,
        versionNumber
      );
    } catch (error) {
      console.error("Error deleting version:", error);
      throw error;
    }
  }

  /**
   * List all pages with pagination
   * @param {Object} options Pagination and search options
   * @returns {Promise<Object>} Pages and pagination info
   */
  async listAllPages(options = {}) {
    try {
      return await this.pageRepository.listAll(options);
    } catch (error) {
      console.error("Error listing all pages:", error);
      throw error;
    }
  }

  /**
   * Get page by ID
   * @param {number} id Page ID
   * @returns {Promise<WebsitePage|null>} Page or null if not found
   */
  async getPageById(id) {
    try {
      return await this.pageRepository.getById(id);
    } catch (error) {
      console.error("Error getting page by ID:", error);
      throw error;
    }
  }
}

module.exports = WebsiteContentService;
