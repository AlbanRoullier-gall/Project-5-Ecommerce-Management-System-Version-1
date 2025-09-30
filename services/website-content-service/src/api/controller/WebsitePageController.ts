/**
 * Website Page Controller
 * HTTP request handling for website pages
 *
 * Architecture : Controller pattern
 * - HTTP request handling
 * - Service orchestration
 * - Response formatting
 */

import { Request, Response } from "express";
import WebsiteContentService from "../../services/WebsiteContentService";
import { WebsitePageMapper, ResponseMapper } from "../mapper";
import { WebsitePageCreateDTO, WebsitePageUpdateDTO } from "../dto";

export class WebsitePageController {
  private websiteContentService: WebsiteContentService;

  constructor(websiteContentService: WebsiteContentService) {
    this.websiteContentService = websiteContentService;
  }

  /**
   * Create a new website page
   */
  async createPage(req: Request, res: Response): Promise<void> {
    try {
      const pageData = WebsitePageMapper.websitePageCreateDTOToWebsitePageData(
        req.body as WebsitePageCreateDTO
      );
      const page = await this.websiteContentService.createPage(
        pageData.page_title!,
        pageData.page_slug!,
        pageData.markdown_content!
      );
      res
        .status(201)
        .json(
          ResponseMapper.pageCreated(
            WebsitePageMapper.websitePageToPublicDTO(page)
          )
        );
    } catch (error: any) {
      console.error("Create page error:", error);
      if (error.message === "Page with this slug already exists") {
        res.status(409).json(ResponseMapper.conflictError(error.message));
        return;
      }
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Get page by slug
   */
  async getPageBySlug(req: Request, res: Response): Promise<void> {
    try {
      const { slug } = req.params;
      const page = await this.websiteContentService.getPageBySlug(slug);

      if (!page) {
        res.status(404).json(ResponseMapper.notFoundError("Page"));
        return;
      }

      res.json(
        ResponseMapper.pageRetrieved(
          WebsitePageMapper.websitePageToPublicDTO(page)
        )
      );
    } catch (error: any) {
      console.error("Get page error:", error);
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Update page
   */
  async updatePage(req: Request, res: Response): Promise<void> {
    try {
      const { slug } = req.params;
      const pageData = WebsitePageMapper.websitePageUpdateDTOToWebsitePageData(
        req.body as WebsitePageUpdateDTO
      );
      const page = await this.websiteContentService.updatePage(slug, pageData);

      if (!page) {
        res.status(404).json(ResponseMapper.notFoundError("Page"));
        return;
      }

      res.json(
        ResponseMapper.pageUpdated(
          WebsitePageMapper.websitePageToPublicDTO(page)
        )
      );
    } catch (error: any) {
      console.error("Update page error:", error);
      if (error.message === "Page not found") {
        res.status(404).json(ResponseMapper.notFoundError("Page"));
        return;
      }
      if (error.message === "Page with this slug already exists") {
        res.status(409).json(ResponseMapper.conflictError(error.message));
        return;
      }
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Delete page
   */
  async deletePage(req: Request, res: Response): Promise<void> {
    try {
      const { slug } = req.params;
      const success = await this.websiteContentService.deletePage(slug);

      if (!success) {
        res.status(404).json(ResponseMapper.notFoundError("Page"));
        return;
      }

      res.json(ResponseMapper.pageDeleted());
    } catch (error: any) {
      console.error("Delete page error:", error);
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * List all pages
   */
  async listPages(req: Request, res: Response): Promise<void> {
    try {
      const options = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        search: req.query.search as string,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as "asc" | "desc",
      };

      const result = await this.websiteContentService.listAllPages(options);

      res.json(ResponseMapper.pageListed(result));
    } catch (error: any) {
      console.error("List pages error:", error);
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Get all page slugs
   */
  async getAllSlugs(req: Request, res: Response): Promise<void> {
    try {
      const slugs = await this.websiteContentService.getAllPageSlugs();
      res.json(ResponseMapper.slugsRetrieved(slugs));
    } catch (error: any) {
      console.error("Get slugs error:", error);
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }
}
