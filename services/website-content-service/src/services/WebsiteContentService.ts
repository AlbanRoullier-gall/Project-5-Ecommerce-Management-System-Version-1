/**
 * WebsiteContentService
 * Business logic layer for website content management
 *
 * Architecture : Service pattern
 * - Business logic orchestration
 * - Repository coordination
 * - Data validation
 */

import { Pool } from "pg";
import { marked } from "marked";
import { WebsitePageRepository } from "../repositories/WebsitePageRepository";
import { WebsitePageVersionRepository } from "../repositories/WebsitePageVersionRepository";
import WebsitePage, { WebsitePageData } from "../models/WebsitePage";
import WebsitePageVersion from "../models/WebsitePageVersion";

export default class WebsiteContentService {
  private pageRepository: WebsitePageRepository;
  private versionRepository: WebsitePageVersionRepository;

  constructor(pool: Pool) {
    this.pageRepository = new WebsitePageRepository(pool);
    this.versionRepository = new WebsitePageVersionRepository(pool);
  }

  /**
   * Format markdown content to HTML
   * @param {string} markdown Markdown content
   * @returns {string} HTML content
   */
  formatMarkdownToHtml(markdown: string): string {
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

  // ===== PAGE METHODS =====

  /**
   * Create a new page
   * @param {string} pageTitle Page title
   * @param {string} pageSlug Page slug
   * @param {string} markdownContent Markdown content
   * @returns {Promise<WebsitePage>} Created page
   */
  async createPage(
    pageTitle: string,
    pageSlug: string,
    markdownContent: string
  ): Promise<WebsitePage> {
    // Validate required fields
    if (!pageTitle || pageTitle.trim().length === 0) {
      throw new Error("Page title is required");
    }
    if (!pageSlug || pageSlug.trim().length === 0) {
      throw new Error("Page slug is required");
    }
    if (!markdownContent || markdownContent.trim().length === 0) {
      throw new Error("Markdown content is required");
    }

    // Check if page slug already exists
    const slugExists = await this.pageRepository.pageSlugExists(pageSlug);
    if (slugExists) {
      throw new Error("Page with this slug already exists");
    }

    // Generate HTML content
    const htmlContent = this.formatMarkdownToHtml(markdownContent);

    const pageData: Partial<WebsitePageData> = {
      page_slug: pageSlug,
      page_title: pageTitle,
      markdown_content: markdownContent,
      html_content: htmlContent,
      version: 1,
    };

    return await this.pageRepository.createPage(pageData as WebsitePageData);
  }

  /**
   * Get page by slug
   * @param {string} slug Page slug
   * @returns {Promise<WebsitePage|null>} Page or null if not found
   */
  async getPageBySlug(slug: string): Promise<WebsitePage | null> {
    return await this.pageRepository.getPageBySlug(slug);
  }

  /**
   * Update page
   * @param {string} slug Page slug
   * @param {Partial<WebsitePageData>} pageData Page data to update
   * @returns {Promise<WebsitePage|null>} Updated page or null if not found
   */
  async updatePage(
    slug: string,
    pageData: Partial<WebsitePageData>
  ): Promise<WebsitePage | null> {
    // Check if page exists
    const existingPage = await this.pageRepository.getPageBySlug(slug);
    if (!existingPage) {
      throw new Error("Page not found");
    }

    // If slug is being changed, check if new slug already exists
    if (pageData.page_slug && pageData.page_slug !== slug) {
      const slugExists = await this.pageRepository.pageSlugExists(
        pageData.page_slug,
        slug
      );
      if (slugExists) {
        throw new Error("Page with this slug already exists");
      }
    }

    // If markdown content is being changed, regenerate HTML
    if (pageData.markdown_content) {
      pageData.html_content = this.formatMarkdownToHtml(
        pageData.markdown_content
      );
    }

    return await this.pageRepository.updatePage(slug, pageData);
  }

  /**
   * Delete page
   * @param {string} slug Page slug
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  async deletePage(slug: string): Promise<boolean> {
    return await this.pageRepository.deletePage(slug);
  }

  /**
   * List all pages with pagination and filtering
   * @param {Object} options List options
   * @returns {Promise<Object>} Pages with pagination info
   */
  async listAllPages(options: {
    page: number;
    limit: number;
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }): Promise<{
    pages: WebsitePage[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    return await this.pageRepository.listPages(options);
  }

  /**
   * Get all page slugs
   * @returns {Promise<string[]>} Array of page slugs
   */
  async getAllPageSlugs(): Promise<string[]> {
    return await this.pageRepository.getAllPageSlugs();
  }

  // ===== VERSION METHODS =====

  /**
   * List versions for a page
   * @param {string} slug Page slug
   * @returns {Promise<WebsitePageVersion[]>} Array of versions
   */
  async listVersions(slug: string): Promise<WebsitePageVersion[]> {
    // Get page first
    const page = await this.pageRepository.getPageBySlug(slug);
    if (!page) {
      throw new Error("Page not found");
    }

    return await this.versionRepository.listVersionsByPage(page.id!);
  }

  /**
   * Rollback page to a specific version
   * @param {string} slug Page slug
   * @param {number} versionNumber Version number
   * @returns {Promise<WebsitePage|null>} Updated page or null if not found
   */
  async rollbackPage(
    slug: string,
    versionNumber: number
  ): Promise<WebsitePage | null> {
    // Get page first
    const page = await this.pageRepository.getPageBySlug(slug);
    if (!page) {
      throw new Error("Page not found");
    }

    // Get the version to rollback to
    const version = await this.versionRepository.getVersionByPageAndNumber(
      page.id!,
      versionNumber
    );
    if (!version) {
      throw new Error("Version not found");
    }

    // Update page with version content
    const pageData: Partial<WebsitePageData> = {
      markdown_content: version.markdownContent,
      html_content: version.htmlContent,
    };

    return await this.pageRepository.updatePage(slug, pageData);
  }

  /**
   * Delete a specific version
   * @param {string} slug Page slug
   * @param {number} versionNumber Version number
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  async deleteVersion(slug: string, versionNumber: number): Promise<boolean> {
    // Get page first
    const page = await this.pageRepository.getPageBySlug(slug);
    if (!page) {
      throw new Error("Page not found");
    }

    // Check if this is the current version
    if (page.version === versionNumber) {
      throw new Error("Cannot delete the current version");
    }

    // Get the version to delete
    const version = await this.versionRepository.getVersionByPageAndNumber(
      page.id!,
      versionNumber
    );
    if (!version) {
      throw new Error("Version not found");
    }

    return await this.versionRepository.deleteVersion(version.id!);
  }
}
