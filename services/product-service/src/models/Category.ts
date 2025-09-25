/**
 * Category ORM Entity
 * Represents a product category
 */
import { CategoryData, CategoryDbRow } from "../types";

export default class Category {
  public id: number | null;
  public name: string;
  public description: string;
  public createdAt: Date | null;
  public updatedAt: Date | null;

  constructor(data: CategoryData = {} as CategoryData) {
    this.id = data.id ?? null;
    this.name = data.name ?? "";
    this.description = data.description ?? "";
    this.createdAt = data.createdAt ?? null;
    this.updatedAt = data.updatedAt ?? null;
  }

  /**
   * Get full name of the category
   * @returns {string} Full category name
   */
  getFullName(): string {
    return this.name;
  }

  /**
   * Convert entity to database row format
   * @returns {Object} Database row
   */
  toDbRow(): CategoryDbRow {
    return {
      id: this.id!,
      name: this.name,
      description: this.description,
      created_at: this.createdAt!,
      updated_at: this.updatedAt!,
    };
  }

  /**
   * Create entity from database row
   * @param {Object} row Database row
   * @returns {Category} Category instance
   */
  static fromDbRow(row: CategoryDbRow): Category {
    return new Category({
      id: row.id,
      name: row.name,
      description: row.description,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }

  /**
   * Convert to public DTO
   * @returns {Object} Public category data
   */
  toPublicDTO(): any {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      fullName: this.getFullName(),
    };
  }

  /**
   * Validate entity data
   * @returns {Object} Validation result
   */
  validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.name || this.name.trim().length === 0) {
      errors.push("Category name is required");
    }

    if (this.name && this.name.length > 100) {
      errors.push("Category name must be 100 characters or less");
    }

    if (this.description && this.description.length > 500) {
      errors.push("Description must be 500 characters or less");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
