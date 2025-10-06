/**
 * DTOs pour le service contenu web
 * Types partagés pour l'API REST
 */

// ===== TYPES BASÉS SUR WebsitePageData =====

/**
 * DTO pour la création d'une page web
 * Basé sur WebsitePageData avec conversion camelCase
 */
export interface WebsitePageCreateDTO {
  pageSlug: string;
  pageTitle: string;
  markdownContent: string;
  htmlContent?: string;
  version?: number;
}

/**
 * DTO pour la mise à jour d'une page web
 * Utilise Partial pour rendre tous les champs optionnels
 */
export interface WebsitePageUpdateDTO {
  pageSlug?: string;
  pageTitle?: string;
  markdownContent?: string;
  htmlContent?: string;
  version?: number;
}

/**
 * DTO public pour une page web
 * Basé sur WebsitePageData avec informations de version
 */
export interface WebsitePagePublicDTO {
  id: number;
  pageSlug: string;
  pageTitle: string;
  markdownContent: string;
  htmlContent: string | null;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  versions?: WebsitePageVersionPublicDTO[];
}

// ===== TYPES BASÉS SUR WebsitePageVersionData =====

/**
 * DTO pour la création d'une version de page web
 * Basé sur WebsitePageVersionData avec conversion camelCase
 */
export interface WebsitePageVersionCreateDTO {
  pageId: number;
  markdownContent: string;
  htmlContent?: string;
  version: number;
}

/**
 * DTO pour la mise à jour d'une version de page web
 * Utilise Partial pour rendre tous les champs optionnels
 */
export interface WebsitePageVersionUpdateDTO {
  markdownContent?: string;
  htmlContent?: string;
  version?: number;
}

/**
 * DTO public pour une version de page web
 * Basé sur WebsitePageVersionData
 */
export interface WebsitePageVersionPublicDTO {
  id: number;
  pageId: number;
  markdownContent: string;
  htmlContent: string | null;
  version: number;
  createdAt: Date;
}

// ===== TYPES SPÉCIFIQUES =====

/**
 * DTO pour les options de recherche de pages web
 */
export interface WebsitePageSearchDTO {
  page?: number;
  limit?: number;
  search?: string;
  slug?: string;
  sortBy?: "pageTitle" | "createdAt" | "updatedAt" | "version";
  sortOrder?: "asc" | "desc";
}

/**
 * DTO pour les options de recherche de versions de pages
 */
export interface WebsitePageVersionSearchDTO {
  page?: number;
  limit?: number;
  pageId?: number;
  version?: number;
  sortBy?: "version" | "createdAt";
  sortOrder?: "asc" | "desc";
}

/**
 * DTO pour la réponse de liste de pages web
 */
export interface WebsitePageListDTO {
  pages: WebsitePagePublicDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * DTO pour la réponse de liste de versions de pages
 */
export interface WebsitePageVersionListDTO {
  versions: WebsitePageVersionPublicDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * DTO pour les statistiques de contenu web
 */
export interface WebsiteContentStatsDTO {
  totalPages: number;
  totalVersions: number;
  averageVersionsPerPage: number;
  pagesByVersion: Record<string, number>;
  recentUpdates: WebsitePagePublicDTO[];
}

/**
 * DTO pour la publication d'une page
 */
export interface WebsitePagePublishDTO {
  pageId: number;
  version: number;
  publishDate?: Date;
  isActive?: boolean;
}

/**
 * DTO pour la réponse de publication
 */
export interface WebsitePagePublishResponseDTO {
  success: boolean;
  page?: WebsitePagePublicDTO;
  error?: string;
}

/**
 * DTO pour l'import de contenu
 */
export interface WebsiteContentImportDTO {
  pages: WebsitePageCreateDTO[];
  overwriteExisting?: boolean;
  createVersions?: boolean;
}

/**
 * DTO pour la réponse d'import
 */
export interface WebsiteContentImportResponseDTO {
  success: boolean;
  importedPages: number;
  errors: string[];
  pages?: WebsitePagePublicDTO[];
}

/**
 * DTO pour l'export de contenu
 */
export interface WebsiteContentExportDTO {
  pageIds?: number[];
  includeVersions?: boolean;
  format?: "json" | "markdown" | "html";
}

/**
 * DTO pour la réponse d'export
 */
export interface WebsiteContentExportResponseDTO {
  success: boolean;
  content: any;
  format: string;
  pagesCount: number;
}

/**
 * DTO pour la validation de contenu
 */
export interface WebsiteContentValidationDTO {
  markdownContent: string;
  htmlContent?: string;
  validateMarkdown?: boolean;
  validateHtml?: boolean;
}

/**
 * DTO pour la réponse de validation
 */
export interface WebsiteContentValidationResponseDTO {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

/**
 * DTO pour les métadonnées de page
 */
export interface WebsitePageMetadataDTO {
  seoTitle?: string;
  seoDescription?: string;
  keywords?: string[];
  author?: string;
  tags?: string[];
  category?: string;
  status?: "draft" | "published" | "archived";
  featuredImage?: string;
  customFields?: Record<string, any>;
}

/**
 * DTO pour les options de rendu
 */
export interface WebsitePageRenderDTO {
  pageId: number;
  version?: number;
  template?: string;
  includeMetadata?: boolean;
  includeVersions?: boolean;
}

/**
 * DTO pour la réponse de rendu
 */
export interface WebsitePageRenderResponseDTO {
  success: boolean;
  html?: string;
  metadata?: WebsitePageMetadataDTO;
  error?: string;
}
