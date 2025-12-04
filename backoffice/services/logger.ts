/**
 * Service de logging centralisé
 * Gère tous les logs d'erreur de manière cohérente
 */

/**
 * Niveaux de log
 */
export enum LogLevel {
  ERROR = "error",
  WARN = "warn",
  INFO = "info",
  DEBUG = "debug",
}

/**
 * Service de logging
 */
class Logger {
  /**
   * Log une erreur
   */
  error(message: string, error?: any, context?: Record<string, any>): void {
    if (process.env.NODE_ENV === "development") {
      console.error(`[ERROR] ${message}`, {
        error,
        context,
        timestamp: new Date().toISOString(),
      });
    }
    // En production, on pourrait envoyer les erreurs à un service de monitoring
    // comme Sentry, LogRocket, etc.
  }

  /**
   * Log un avertissement
   */
  warn(message: string, context?: Record<string, any>): void {
    if (process.env.NODE_ENV === "development") {
      console.warn(`[WARN] ${message}`, {
        context,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Log une information
   */
  info(message: string, context?: Record<string, any>): void {
    if (process.env.NODE_ENV === "development") {
      console.info(`[INFO] ${message}`, {
        context,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Log pour le debug
   */
  debug(message: string, context?: Record<string, any>): void {
    if (process.env.NODE_ENV === "development") {
      console.debug(`[DEBUG] ${message}`, {
        context,
        timestamp: new Date().toISOString(),
      });
    }
  }
}

// Instance singleton
export const logger = new Logger();
