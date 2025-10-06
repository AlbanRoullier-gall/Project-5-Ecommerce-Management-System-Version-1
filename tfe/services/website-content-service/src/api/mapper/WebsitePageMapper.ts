/**
 * Website Page Mapper
 * Mapper pour les conversions DTO ↔ Model
 *
 * Architecture : Mapper pattern
 * - Conversion entre DTOs et Models
 * - Transformation des données
 * - Séparation des responsabilités
 */

import {
  WebsitePageCreateDTO,
  WebsitePageUpdateDTO,
  WebsitePagePublicDTO,
  WebsitePageVersionCreateDTO,
  WebsitePageVersionUpdateDTO,
  WebsitePageVersionPublicDTO,
} from "../dto";
import { WebsitePageData } from "../../models/WebsitePage";
import { WebsitePageVersionData } from "../../models/WebsitePageVersion";

/**
 * Website Page Mapper class
 */
export class WebsitePageMapper {
  /**
   * Convert WebsitePageCreateDTO to WebsitePageData
   */
  static websitePageCreateDTOToWebsitePageData(
    dto: WebsitePageCreateDTO
  ): Partial<WebsitePageData> {
    return {
      page_slug: dto.pageSlug,
      page_title: dto.pageTitle,
      markdown_content: dto.markdownContent,
    };
  }

  /**
   * Convert WebsitePageUpdateDTO to WebsitePageData
   */
  static websitePageUpdateDTOToWebsitePageData(
    dto: WebsitePageUpdateDTO
  ): Partial<WebsitePageData> {
    const data: Partial<WebsitePageData> = {};
    if (dto.pageSlug !== undefined) data.page_slug = dto.pageSlug;
    if (dto.pageTitle !== undefined) data.page_title = dto.pageTitle;
    if (dto.markdownContent !== undefined)
      data.markdown_content = dto.markdownContent;
    return data;
  }

  /**
   * Convert WebsitePage model to WebsitePagePublicDTO
   */
  static websitePageToPublicDTO(page: any): WebsitePagePublicDTO {
    return {
      id: page.id,
      pageSlug: page.pageSlug,
      pageTitle: page.pageTitle,
      markdownContent: page.markdownContent,
      htmlContent: page.htmlContent,
      version: page.version,
      createdAt: page.createdAt,
      updatedAt: page.updatedAt,
    };
  }

  /**
   * Convert WebsitePageVersionCreateDTO to WebsitePageVersionData
   */
  static websitePageVersionCreateDTOToWebsitePageVersionData(
    dto: WebsitePageVersionCreateDTO
  ): Partial<WebsitePageVersionData> {
    return {
      markdown_content: dto.markdownContent,
    };
  }

  /**
   * Convert WebsitePageVersionUpdateDTO to WebsitePageVersionData
   */
  static websitePageVersionUpdateDTOToWebsitePageVersionData(
    dto: WebsitePageVersionUpdateDTO
  ): Partial<WebsitePageVersionData> {
    const data: Partial<WebsitePageVersionData> = {};
    if (dto.markdownContent !== undefined)
      data.markdown_content = dto.markdownContent;
    return data;
  }

  /**
   * Convert WebsitePageVersion model to WebsitePageVersionPublicDTO
   */
  static websitePageVersionToPublicDTO(
    version: any
  ): WebsitePageVersionPublicDTO {
    return {
      id: version.id,
      pageId: version.pageId,
      versionNumber: version.versionNumber,
      markdownContent: version.markdownContent,
      htmlContent: version.htmlContent,
      createdAt: version.createdAt,
    };
  }
}
