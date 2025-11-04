/**
 * Configuration de multer pour gérer les uploads de fichiers
 */

import multer from "multer";

/**
 * Configuration de multer pour gérer les uploads
 */
export const createUploadMiddleware = (
  type: "single" | "multiple",
  field: string,
  maxFiles?: number
) => {
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  });

  return type === "multiple"
    ? upload.array(field, maxFiles || 10)
    : upload.single(field);
};
