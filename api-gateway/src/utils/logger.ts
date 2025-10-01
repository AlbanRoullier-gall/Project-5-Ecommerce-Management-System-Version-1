/**
 * Logger centralisé avec Winston
 * Gestion structurée des logs pour toute l'application
 */

import winston from "winston";
import { gatewayConfig } from "../config/services.config";

/**
 * Format personnalisé pour les logs
 */
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

/**
 * Format console pour le développement
 */
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf((info: any) => {
    const { timestamp, level, message, ...meta } = info;
    let metaStr = "";
    if (Object.keys(meta).length > 0) {
      metaStr = JSON.stringify(meta, null, 2);
    }
    return `${timestamp} [${level}]: ${message} ${metaStr}`;
  })
);

/**
 * Instance du logger Winston
 */
const logger = winston.createLogger({
  level: gatewayConfig.logLevel,
  format: logFormat,
  defaultMeta: { service: "api-gateway" },
  transports: [
    // Console (toujours actif)
    new winston.transports.Console({
      format: consoleFormat,
    }),
  ],
});

/**
 * En production, ajouter des transports pour fichiers
 */
if (gatewayConfig.nodeEnv === "production") {
  logger.add(
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
  logger.add(
    new winston.transports.File({
      filename: "logs/combined.log",
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
}

/**
 * Fonction helper pour logger les requêtes
 */
export const logRequest = (
  method: string,
  path: string,
  statusCode: number,
  duration: number,
  service?: string,
  error?: string
): void => {
  const logData = {
    method,
    path,
    statusCode,
    duration: `${duration}ms`,
    ...(service && { service }),
    ...(error && { error }),
  };

  if (statusCode >= 500) {
    logger.error("Request failed", logData);
  } else if (statusCode >= 400) {
    logger.warn("Request error", logData);
  } else {
    logger.info("Request completed", logData);
  }
};

/**
 * Fonction helper pour logger les erreurs de service
 */
export const logServiceError = (
  serviceName: string,
  endpoint: string,
  error: any
): void => {
  logger.error("Service communication error", {
    service: serviceName,
    endpoint,
    error: error.message,
    code: error.code,
    ...(error.response && {
      statusCode: error.response.status,
      responseData: error.response.data,
    }),
  });
};

/**
 * Fonction helper pour logger les événements système
 */
export const logSystemEvent = (event: string, data?: any): void => {
  logger.info(event, data);
};

export default logger;
