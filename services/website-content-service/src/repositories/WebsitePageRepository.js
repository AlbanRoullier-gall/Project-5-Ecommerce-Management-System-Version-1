/**
 * WebsitePageRepository
 * Handles database operations for WebsitePage entities
 */
const WebsitePage = require("../models/WebsitePage");

class WebsitePageRepository {
  constructor(pool) {
    this.pool = pool;
  }

  /**
   * Get page by ID
   * @param {number} id Page ID
   * @returns {Promise<WebsitePage|null>} WebsitePage or null if not found
   */
  async getById(id) {
    try {
      const result = await this.pool.query(
        `SELECT page_id, page_slug, page_title, markdown_content, html_content, 
                version, creation_timestamp, last_update_timestamp
         FROM website_pages 
         WHERE page_id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return WebsitePage.fromDbRow(result.rows[0]);
    } catch (error) {
      console.error("Error getting page by ID:", error);
      throw new Error("Failed to retrieve page");
    }
  }

  /**
   * Get page by slug
   * @param {string} slug Page slug
   * @returns {Promise<WebsitePage|null>} WebsitePage or null if not found
   */
  async getBySlug(slug) {
    try {
      const result = await this.pool.query(
        `SELECT page_id, page_slug, page_title, markdown_content, html_content, 
                version, creation_timestamp, last_update_timestamp
         FROM website_pages 
         WHERE page_slug = $1`,
        [slug]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return WebsitePage.fromDbRow(result.rows[0]);
    } catch (error) {
      console.error("Error getting page by slug:", error);
      throw new Error("Failed to retrieve page");
    }
  }

  /**
   * List all page slugs
   * @returns {Promise<string[]>} Array of page slugs
   */
  async listAllSlugs() {
    try {
      const result = await this.pool.query(
        "SELECT page_slug FROM website_pages ORDER BY page_slug"
      );

      return result.rows.map((row) => row.page_slug);
    } catch (error) {
      console.error("Error listing page slugs:", error);
      throw new Error("Failed to retrieve page slugs");
    }
  }

  /**
   * Save new page
   * @param {WebsitePage} page Page entity to save
   * @returns {Promise<WebsitePage>} Saved page with ID
   */
  async save(page) {
    try {
      const validation = page.validate();
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
      }

      const result = await this.pool.query(
        `INSERT INTO website_pages (page_slug, page_title, markdown_content, html_content, 
                                   version, creation_timestamp, last_update_timestamp)
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
         RETURNING page_id, page_slug, page_title, markdown_content, html_content, 
                   version, creation_timestamp, last_update_timestamp`,
        [
          page.pageSlug,
          page.pageTitle,
          page.markdownContent,
          page.htmlContent,
          page.version,
        ]
      );

      return WebsitePage.fromDbRow(result.rows[0]);
    } catch (error) {
      console.error("Error saving page:", error);
      throw new Error("Failed to save page");
    }
  }

  /**
   * Update existing page
   * @param {WebsitePage} page Page entity to update
   * @returns {Promise<WebsitePage>} Updated page
   */
  async update(page) {
    try {
      const validation = page.validate();
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
      }

      const result = await this.pool.query(
        `UPDATE website_pages 
         SET page_slug = $1, page_title = $2, markdown_content = $3, html_content = $4, 
             version = $5, last_update_timestamp = NOW()
         WHERE page_id = $6
         RETURNING page_id, page_slug, page_title, markdown_content, html_content, 
                   version, creation_timestamp, last_update_timestamp`,
        [
          page.pageSlug,
          page.pageTitle,
          page.markdownContent,
          page.htmlContent,
          page.version,
          page.pageId,
        ]
      );

      if (result.rows.length === 0) {
        throw new Error("Page not found");
      }

      return WebsitePage.fromDbRow(result.rows[0]);
    } catch (error) {
      console.error("Error updating page:", error);
      throw new Error("Failed to update page");
    }
  }

  /**
   * Delete page
   * @param {WebsitePage} page Page entity to delete
   * @returns {Promise<boolean>} True if deleted successfully
   */
  async delete(page) {
    try {
      const result = await this.pool.query(
        "DELETE FROM website_pages WHERE page_id = $1 RETURNING page_id",
        [page.pageId]
      );

      return result.rows.length > 0;
    } catch (error) {
      console.error("Error deleting page:", error);
      throw new Error("Failed to delete page");
    }
  }

  /**
   * Check if page slug exists
   * @param {string} slug Page slug to check
   * @param {number|null} excludeId Page ID to exclude from check (for updates)
   * @returns {Promise<boolean>} True if slug exists
   */
  async slugExists(slug, excludeId = null) {
    try {
      let query = "SELECT page_id FROM website_pages WHERE page_slug = $1";
      const params = [slug];

      if (excludeId) {
        query += " AND page_id != $2";
        params.push(excludeId);
      }

      const result = await this.pool.query(query, params);
      return result.rows.length > 0;
    } catch (error) {
      console.error("Error checking slug existence:", error);
      throw new Error("Failed to check slug existence");
    }
  }

  /**
   * List all pages with pagination
   * @param {Object} options Pagination options
   * @returns {Promise<Object>} Pages and pagination info
   */
  async listAll(options = {}) {
    try {
      const { page = 1, limit = 10, search = "" } = options;
      const offset = (page - 1) * limit;

      let query = `
        SELECT page_id, page_slug, page_title, markdown_content, html_content, 
               version, creation_timestamp, last_update_timestamp
        FROM website_pages
      `;

      const params = [];
      let paramCount = 0;

      if (search) {
        query += ` WHERE (page_title ILIKE $${++paramCount} OR page_slug ILIKE $${paramCount})`;
        params.push(`%${search}%`);
      }

      query += ` ORDER BY last_update_timestamp DESC LIMIT $${++paramCount} OFFSET $${++paramCount}`;
      params.push(limit, offset);

      const result = await this.pool.query(query, params);

      // Get total count
      let countQuery = "SELECT COUNT(*) FROM website_pages";
      if (search) {
        countQuery += ` WHERE (page_title ILIKE $1 OR page_slug ILIKE $1)`;
      }
      const countResult = await this.pool.query(
        countQuery,
        search ? [`%${search}%`] : []
      );

      return {
        pages: result.rows.map((row) => WebsitePage.fromDbRow(row)),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: parseInt(countResult.rows[0].count),
          pages: Math.ceil(countResult.rows[0].count / limit),
        },
      };
    } catch (error) {
      console.error("Error listing pages:", error);
      throw new Error("Failed to list pages");
    }
  }
}

module.exports = WebsitePageRepository;
