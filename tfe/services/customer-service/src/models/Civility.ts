/**
 * Civility ORM Entity
 * Represents civility titles (Mr, Mrs, etc.)
 */
export interface CivilityData {
  civilityId?: number | null;
  abbreviation?: string;
  createdAt?: Date | null;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

class Civility {
  public civilityId: number | null;
  public abbreviation: string;
  public createdAt: Date | null;

  constructor(data: CivilityData = {}) {
    this.civilityId = data.civilityId || null;
    this.abbreviation = data.abbreviation || "";
    this.createdAt = data.createdAt || null;
  }

  /**
   * Validate entity data
   * @returns {Object} Validation result
   */
  validate(): ValidationResult {
    const errors: string[] = [];

    if (!this.abbreviation || this.abbreviation.trim().length === 0) {
      errors.push("Abbreviation is required");
    }

    if (this.abbreviation && this.abbreviation.length > 10) {
      errors.push("Abbreviation must be 10 characters or less");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

export default Civility;
