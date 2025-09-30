/**
 * WebsitePageVersionRepository
 * Handles database operations for WebsitePageVersion entities
 *
 * Architecture : Repository pattern
 * - Database abstraction
 * - Query optimization
 * - Error handling
 */

import { Pool } from "pg";
import WebsitePageVersion, {
  WebsitePageVersionData,
} from "../models/WebsitePageVersion";

export class WebsitePageVersionRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  /**
   * Create a new version
   * @param {Partial<WebsitePageVersionData>} versionData Version data
   * @returns {Promise<WebsitePageVersion>} Created version
   */
  async createVersion(
    versionData: Partial<WebsitePageVersionData>
  ): Promise<WebsitePageVersion> {
    try {
      const query = `
        INSERT INTO website_page_versions (parent_page_id, markdown_content, html_content, version)
        VALUES ($1, $2, $3, $4)
        RETURNING version_id, parent_page_id, markdown_content, html_content, version, creation_timestamp
      `;

      const values = [
        versionData.parent_page_id,
        versionData.markdown_content,
        versionData.html_content,
        versionData.version,
      ];

      const result = await this.pool.query(query, values);
      return new WebsitePageVersion(result.rows[0] as WebsitePageVersionData);
    } catch (error) {
      console.error("Error creating version:", error);
      throw error;
    }
  }

  /**
   * Get version by ID
   * @param {number} id Version ID
   * @returns {Promise<WebsitePageVersion|null>} Version or null if not found
   */
  async getVersionById(id: number): Promise<WebsitePageVersion | null> {
    try {
      const result = await this.pool.query(
        `SELECT version_id, parent_page_id, markdown_content, html_content, version, creation_timestamp
         FROM website_page_versions 
         WHERE version_id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return new WebsitePageVersion(result.rows[0] as WebsitePageVersionData);
    } catch (error) {
      console.error("Error getting version by ID:", error);
      throw error;
    }
  }

  /**
   * Get version by page ID and version number
   * @param {number} pageId Page ID
   * @param {number} versionNumber Version number
   * @returns {Promise<WebsitePageVersion|null>} Version or null if not found
   */
  async getVersionByPageAndNumber(
    pageId: number,
    versionNumber: number
  ): Promise<WebsitePageVersion | null> {
    try {
      const result = await this.pool.query(
        `SELECT version_id, parent_page_id, markdown_content, html_content, version, creation_timestamp
         FROM website_page_versions 
         WHERE parent_page_id = $1 AND version = $2`,
        [pageId, versionNumber]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return new WebsitePageVersion(result.rows[0] as WebsitePageVersionData);
    } catch (error) {
      console.error("Error getting version by page and number:", error);
      throw error;
    }
  }

  /**
   * Update version
   * @param {number} id Version ID
   * @param {Partial<WebsitePageVersionData>} versionData Version data to update
   * @returns {Promise<WebsitePageVersion|null>} Updated version or null if not found
   */
  async updateVersion(
    id: number,
    versionData: Partial<WebsitePageVersionData>
  ): Promise<WebsitePageVersion | null> {
    try {
      const setClause = [];
      const values = [];
      let paramCount = 0;

      if (versionData.markdown_content !== undefined) {
        setClause.push(`markdown_content = $${++paramCount}`);
        values.push(versionData.markdown_content);
      }

      if (versionData.html_content !== undefined) {
        setClause.push(`html_content = $${++paramCount}`);
        values.push(versionData.html_content);
      }

      if (versionData.version !== undefined) {
        setClause.push(`version = $${++paramCount}`);
        values.push(versionData.version);
      }

      if (setClause.length === 0) {
        throw new Error("No fields to update");
      }

      const query = `
        UPDATE website_page_versions 
        SET ${setClause.join(", ")}
        WHERE version_id = $${++paramCount}
        RETURNING version_id, parent_page_id, markdown_content, html_content, version, creation_timestamp
      `;

      values.push(id);

      const result = await this.pool.query(query, values);

      if (result.rows.length === 0) {
        return null;
      }

      return new WebsitePageVersion(result.rows[0] as WebsitePageVersionData);
    } catch (error) {
      console.error("Error updating version:", error);
      throw error;
    }
  }

  /**
   * Delete version
   * @param {number} id Version ID
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  async deleteVersion(id: number): Promise<boolean> {
    try {
      const query = "DELETE FROM website_page_versions WHERE version_id = $1";
      const result = await this.pool.query(query, [id]);
      return result.rowCount! > 0;
    } catch (error) {
      console.error("Error deleting version:", error);
      throw error;
    }
  }

  /**
   * List versions for a page
   * @param {number} pageId Page ID
   * @returns {Promise<WebsitePageVersion[]>} Array of versions
   */
  async listVersionsByPage(pageId: number): Promise<WebsitePageVersion[]> {
    try {
      const result = await this.pool.query(
        `SELECT version_id, parent_page_id, markdown_content, html_content, version, creation_timestamp
         FROM website_page_versions 
         WHERE parent_page_id = $1 
         ORDER BY version DESC`,
        [pageId]
      );

      return result.rows.map(
        (row) => new WebsitePageVersion(row as WebsitePageVersionData)
      );
    } catch (error) {
      console.error("Error listing versions:", error);
      throw error;
    }
  }

  /**
   * Get latest version for a page
   * @param {number} pageId Page ID
   * @returns {Promise<WebsitePageVersion|null>} Latest version or null if not found
   */
  async getLatestVersionByPage(
    pageId: number
  ): Promise<WebsitePageVersion | null> {
    try {
      const result = await this.pool.query(
        `SELECT version_id, parent_page_id, markdown_content, html_content, version, creation_timestamp
         FROM website_page_versions 
         WHERE parent_page_id = $1 
         ORDER BY version DESC 
         LIMIT 1`,
        [pageId]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return new WebsitePageVersion(result.rows[0] as WebsitePageVersionData);
    } catch (error) {
      console.error("Error getting latest version:", error);
      throw error;
    }
  }

  /**
   * Delete all versions for a page
   * @param {number} pageId Page ID
   * @returns {Promise<boolean>} True if deleted
   */
  async deleteVersionsByPage(pageId: number): Promise<boolean> {
    try {
      const query =
        "DELETE FROM website_page_versions WHERE parent_page_id = $1";
      const result = await this.pool.query(query, [pageId]);
      return result.rowCount! > 0;
    } catch (error) {
      console.error("Error deleting versions by page:", error);
      throw error;
    }
  }
}
