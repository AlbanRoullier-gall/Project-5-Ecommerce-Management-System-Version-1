/**
 * Website Page Version Controller
 * HTTP request handling for website page versions
 *
 * Architecture : Controller pattern
 * - HTTP request handling
 * - Service orchestration
 * - Response formatting
 */

import { Request, Response } from "express";
import WebsiteContentService from "../../services/WebsiteContentService";
import { WebsitePageMapper, ResponseMapper } from "../mapper";

export class WebsitePageVersionController {
  private websiteContentService: WebsiteContentService;

  constructor(websiteContentService: WebsiteContentService) {
    this.websiteContentService = websiteContentService;
  }

  /**
   * List versions for a page
   */
  async listVersions(req: Request, res: Response): Promise<void> {
    try {
      const { slug } = req.params;
      const versions = await this.websiteContentService.listVersions(slug);

      const versionsDTO = versions.map((version) =>
        WebsitePageMapper.websitePageVersionToPublicDTO(version)
      );

      res.json(ResponseMapper.versionListed(versionsDTO));
    } catch (error: any) {
      console.error("List versions error:", error);
      if (error.message === "Page not found") {
        res.status(404).json(ResponseMapper.notFoundError("Page"));
        return;
      }
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Rollback to a specific version
   */
  async rollbackPage(req: Request, res: Response): Promise<void> {
    try {
      const { slug } = req.params;
      const { versionNumber } = req.body;

      if (!versionNumber) {
        res
          .status(400)
          .json(ResponseMapper.validationError("Version number is required"));
        return;
      }

      const page = await this.websiteContentService.rollbackPage(
        slug,
        versionNumber
      );

      if (!page) {
        res.status(404).json(ResponseMapper.notFoundError("Page or version"));
        return;
      }

      res.json(
        ResponseMapper.rollbackSuccess(
          WebsitePageMapper.websitePageToPublicDTO(page)
        )
      );
    } catch (error: any) {
      console.error("Rollback page error:", error);
      if (
        error.message === "Page not found" ||
        error.message === "Version not found"
      ) {
        res.status(404).json(ResponseMapper.notFoundError("Page or version"));
        return;
      }
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Delete a specific version
   */
  async deleteVersion(req: Request, res: Response): Promise<void> {
    try {
      const { slug, versionNumber } = req.params;
      const success = await this.websiteContentService.deleteVersion(
        slug,
        parseInt(versionNumber || "0")
      );

      if (!success) {
        res.status(404).json(ResponseMapper.notFoundError("Version"));
        return;
      }

      res.json(ResponseMapper.versionDeleted());
    } catch (error: any) {
      console.error("Delete version error:", error);
      if (
        error.message === "Page not found" ||
        error.message === "Version not found" ||
        error.message === "Cannot delete the current version"
      ) {
        res.status(404).json(ResponseMapper.notFoundError("Page or version"));
        return;
      }
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }
}
