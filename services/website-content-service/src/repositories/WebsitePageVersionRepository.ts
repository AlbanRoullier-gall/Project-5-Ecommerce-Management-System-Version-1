import { Pool } from "pg";
import WebsitePageVersion from "../models/WebsitePageVersion";

/**
 * WebsitePageVersionRepository
 * Handles database operations for WebsitePageVersion entities
 */
export default class WebsitePageVersionRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  /**
   * Get version by ID
   * @param {number} id Version ID
   * @returns {Promise<WebsitePageVersion|null>} WebsitePageVersion or null if not found
   */
  async getById(id: number): Promise<WebsitePageVersion | null> {
    try {
      const result = await this.pool.query(
        `SELECT id, page_id, version_number, markdown_content, html_content, 
                created_at
         FROM website_page_versions 
         WHERE id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return WebsitePageVersion.fromDbRow(result.rows[0]);
    } catch (error) {
      console.error("Error getting version by ID:", error);
      throw new Error("Failed to retrieve version");
    }
  }

  /**
   * List versions by page ID
   * @param {number} pageId Parent page ID
   * @returns {Promise<WebsitePageVersion[]>} Array of versions
   */
  async listByPage(pageId: number): Promise<WebsitePageVersion[]> {
    try {
      const result = await this.pool.query(
        `SELECT id, page_id, version_number, markdown_content, html_content, 
                created_at
         FROM website_page_versions 
         WHERE page_id = $1
         ORDER BY version_number DESC`,
        [pageId]
      );

      return result.rows.map((row) => WebsitePageVersion.fromDbRow(row));
    } catch (error) {
      console.error("Error listing versions by page:", error);
      throw new Error("Failed to retrieve versions");
    }
  }

  /**
   * Get specific version by page ID and version number
   * @param {number} pageId Parent page ID
   * @param {number} versionNumber Version number
   * @returns {Promise<WebsitePageVersion|null>} WebsitePageVersion or null if not found
   */
  async getByPageAndVersion(
    pageId: number,
    versionNumber: number
  ): Promise<WebsitePageVersion | null> {
    try {
      const result = await this.pool.query(
        `SELECT id, page_id, version_number, markdown_content, html_content, 
                created_at
         FROM website_page_versions 
         WHERE page_id = $1 AND version_number = $2`,
        [pageId, versionNumber]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return WebsitePageVersion.fromDbRow(result.rows[0]);
    } catch (error) {
      console.error("Error getting version by page and version:", error);
      throw new Error("Failed to retrieve version");
    }
  }

  /**
   * Save new version
   * @param {WebsitePageVersion} version Version entity to save
   * @returns {Promise<WebsitePageVersion>} Saved version with ID
   */
  async save(version: WebsitePageVersion): Promise<WebsitePageVersion> {
    try {
      const validation = version.validate();
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
      }

      const result = await this.pool.query(
        `INSERT INTO website_page_versions (page_id, version_number, markdown_content, html_content, 
                                          created_at)
         VALUES ($1, $2, $3, $4, NOW())
         RETURNING id, page_id, version_number, markdown_content, html_content, 
                   created_at`,
        [
          version.parentPageId,
          version.versionNumber,
          version.markdownContent,
          version.htmlContent,
        ]
      );

      return WebsitePageVersion.fromDbRow(result.rows[0]);
    } catch (error) {
      console.error("Error saving version:", error);
      throw new Error("Failed to save version");
    }
  }

  /**
   * Delete version
   * @param {WebsitePageVersion} version Version entity to delete
   * @returns {Promise<boolean>} True if deleted successfully
   */
  async delete(version: WebsitePageVersion): Promise<boolean> {
    try {
      const result = await this.pool.query(
        "DELETE FROM website_page_versions WHERE id = $1 RETURNING id",
        [version.versionId]
      );

      return result.rows.length > 0;
    } catch (error) {
      console.error("Error deleting version:", error);
      throw new Error("Failed to delete version");
    }
  }

  /**
   * Delete version by page ID and version number
   * @param {number} pageId Parent page ID
   * @param {number} versionNumber Version number
   * @returns {Promise<boolean>} True if deleted successfully
   */
  async deleteByPageAndVersion(
    pageId: number,
    versionNumber: number
  ): Promise<boolean> {
    try {
      const result = await this.pool.query(
        "DELETE FROM website_page_versions WHERE page_id = $1 AND version_number = $2 RETURNING id",
        [pageId, versionNumber]
      );

      return result.rows.length > 0;
    } catch (error) {
      console.error("Error deleting version by page and version:", error);
      throw new Error("Failed to delete version");
    }
  }

  /**
   * Get latest version for a page
   * @param {number} pageId Parent page ID
   * @returns {Promise<WebsitePageVersion|null>} Latest version or null if none found
   */
  async getLatestVersion(pageId: number): Promise<WebsitePageVersion | null> {
    try {
      const result = await this.pool.query(
        `SELECT id, page_id, version_number, markdown_content, html_content, 
                created_at
         FROM website_page_versions 
         WHERE page_id = $1
         ORDER BY version_number DESC
         LIMIT 1`,
        [pageId]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return WebsitePageVersion.fromDbRow(result.rows[0]);
    } catch (error) {
      console.error("Error getting latest version:", error);
      throw new Error("Failed to retrieve latest version");
    }
  }

  /**
   * Get version count for a page
   * @param {number} pageId Parent page ID
   * @returns {Promise<number>} Number of versions
   */
  async getVersionCount(pageId: number): Promise<number> {
    try {
      const result = await this.pool.query(
        "SELECT COUNT(*) FROM website_page_versions WHERE page_id = $1",
        [pageId]
      );

      return parseInt(result.rows[0].count);
    } catch (error) {
      console.error("Error getting version count:", error);
      throw new Error("Failed to retrieve version count");
    }
  }

  /**
   * Check if version exists for a page
   * @param {number} pageId Parent page ID
   * @param {number} versionNumber Version number
   * @returns {Promise<boolean>} True if version exists
   */
  async versionExists(pageId: number, versionNumber: number): Promise<boolean> {
    try {
      const result = await this.pool.query(
        "SELECT id FROM website_page_versions WHERE page_id = $1 AND version_number = $2",
        [pageId, versionNumber]
      );

      return result.rows.length > 0;
    } catch (error) {
      console.error("Error checking version existence:", error);
      throw new Error("Failed to check version existence");
    }
  }
}
