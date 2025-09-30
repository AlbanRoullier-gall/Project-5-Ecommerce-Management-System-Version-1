/**
 * WebsitePageRepository
 * Handles database operations for WebsitePage entities
 *
 * Architecture : Repository pattern
 * - Database abstraction
 * - Query optimization
 * - Error handling
 */

import { Pool } from "pg";
import WebsitePage, { WebsitePageData } from "../models/WebsitePage";

export class WebsitePageRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  /**
   * Create a new page
   * @param {Partial<WebsitePageData>} pageData Page data
   * @returns {Promise<WebsitePage>} Created page
   */
  async createPage(pageData: Partial<WebsitePageData>): Promise<WebsitePage> {
    try {
      const query = `
        INSERT INTO website_pages (page_slug, page_title, markdown_content, html_content, version)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING page_id, page_slug, page_title, markdown_content, html_content, version, creation_timestamp, last_update_timestamp
      `;

      const values = [
        pageData.page_slug,
        pageData.page_title,
        pageData.markdown_content,
        pageData.html_content,
        pageData.version || 1,
      ];

      const result = await this.pool.query(query, values);
      return new WebsitePage(result.rows[0] as WebsitePageData);
    } catch (error) {
      console.error("Error creating page:", error);
      throw error;
    }
  }

  /**
   * Get page by ID
   * @param {number} id Page ID
   * @returns {Promise<WebsitePage|null>} WebsitePage or null if not found
   */
  async getPageById(id: number): Promise<WebsitePage | null> {
    try {
      const result = await this.pool.query(
        `SELECT page_id, page_slug, page_title, markdown_content, html_content, version, creation_timestamp, last_update_timestamp
         FROM website_pages 
         WHERE page_id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return new WebsitePage(result.rows[0] as WebsitePageData);
    } catch (error) {
      console.error("Error getting page by ID:", error);
      throw error;
    }
  }

  /**
   * Get page by slug
   * @param {string} slug Page slug
   * @returns {Promise<WebsitePage|null>} WebsitePage or null if not found
   */
  async getPageBySlug(slug: string): Promise<WebsitePage | null> {
    try {
      const result = await this.pool.query(
        `SELECT page_id, page_slug, page_title, markdown_content, html_content, version, creation_timestamp, last_update_timestamp
         FROM website_pages 
         WHERE page_slug = $1`,
        [slug]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return new WebsitePage(result.rows[0] as WebsitePageData);
    } catch (error) {
      console.error("Error getting page by slug:", error);
      throw error;
    }
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
    try {
      const setClause = [];
      const values = [];
      let paramCount = 0;

      if (pageData.page_slug !== undefined) {
        setClause.push(`page_slug = $${++paramCount}`);
        values.push(pageData.page_slug);
      }

      if (pageData.page_title !== undefined) {
        setClause.push(`page_title = $${++paramCount}`);
        values.push(pageData.page_title);
      }

      if (pageData.markdown_content !== undefined) {
        setClause.push(`markdown_content = $${++paramCount}`);
        values.push(pageData.markdown_content);
      }

      if (pageData.html_content !== undefined) {
        setClause.push(`html_content = $${++paramCount}`);
        values.push(pageData.html_content);
      }

      if (pageData.version !== undefined) {
        setClause.push(`version = $${++paramCount}`);
        values.push(pageData.version);
      }

      if (setClause.length === 0) {
        throw new Error("No fields to update");
      }

      setClause.push(`last_update_timestamp = NOW()`);

      const query = `
        UPDATE website_pages 
        SET ${setClause.join(", ")}
        WHERE page_slug = $${++paramCount}
        RETURNING page_id, page_slug, page_title, markdown_content, html_content, version, creation_timestamp, last_update_timestamp
      `;

      values.push(slug);

      const result = await this.pool.query(query, values);

      if (result.rows.length === 0) {
        return null;
      }

      return new WebsitePage(result.rows[0] as WebsitePageData);
    } catch (error) {
      console.error("Error updating page:", error);
      throw error;
    }
  }

  /**
   * Delete page
   * @param {string} slug Page slug
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  async deletePage(slug: string): Promise<boolean> {
    try {
      const query = "DELETE FROM website_pages WHERE page_slug = $1";
      const result = await this.pool.query(query, [slug]);
      return result.rowCount! > 0;
    } catch (error) {
      console.error("Error deleting page:", error);
      throw error;
    }
  }

  /**
   * List pages with pagination and filtering
   * @param {Object} options List options
   * @returns {Promise<Object>} Pages with pagination info
   */
  async listPages(options: {
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
    try {
      const {
        page,
        limit,
        search,
        sortBy = "creation_timestamp",
        sortOrder = "desc",
      } = options;
      const offset = (page - 1) * limit;

      let whereClause = "";
      const values = [];
      let paramCount = 0;

      if (search) {
        whereClause = `WHERE (page_title ILIKE $${++paramCount} OR page_slug ILIKE $${++paramCount})`;
        values.push(`%${search}%`, `%${search}%`);
      }

      // Get total count
      const countQuery = `SELECT COUNT(*) as total FROM website_pages ${whereClause}`;
      const countResult = await this.pool.query(countQuery, values);
      const total = parseInt(countResult.rows[0].total);

      // Get pages
      const query = `
        SELECT page_id, page_slug, page_title, markdown_content, html_content, version, creation_timestamp, last_update_timestamp
        FROM website_pages 
        ${whereClause}
        ORDER BY ${sortBy} ${sortOrder.toUpperCase()}
        LIMIT $${++paramCount} OFFSET $${++paramCount}
      `;

      values.push(limit, offset);

      const result = await this.pool.query(query, values);
      const pages = result.rows.map(
        (row) => new WebsitePage(row as WebsitePageData)
      );

      return {
        pages,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error("Error listing pages:", error);
      throw error;
    }
  }

  /**
   * Get all page slugs
   * @returns {Promise<string[]>} Array of page slugs
   */
  async getAllPageSlugs(): Promise<string[]> {
    try {
      const result = await this.pool.query(
        "SELECT page_slug FROM website_pages ORDER BY page_slug"
      );
      return result.rows.map((row) => row.page_slug);
    } catch (error) {
      console.error("Error getting page slugs:", error);
      throw error;
    }
  }

  /**
   * Check if page slug exists
   * @param {string} slug Page slug
   * @param {string} excludeSlug Slug to exclude from check
   * @returns {Promise<boolean>} True if exists
   */
  async pageSlugExists(slug: string, excludeSlug?: string): Promise<boolean> {
    try {
      let query =
        "SELECT COUNT(*) as count FROM website_pages WHERE page_slug = $1";
      const values = [slug];

      if (excludeSlug) {
        query += " AND page_slug != $2";
        values.push(excludeSlug);
      }

      const result = await this.pool.query(query, values);
      return parseInt(result.rows[0].count) > 0;
    } catch (error) {
      console.error("Error checking page slug:", error);
      throw error;
    }
  }
}
