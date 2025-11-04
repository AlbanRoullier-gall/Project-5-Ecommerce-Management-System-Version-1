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

  const middleware =
    type === "multiple"
      ? upload.array(field, maxFiles || 10)
      : upload.single(field);

  // Wrapper pour ajouter des logs de debug
  return (req: any, res: any, next: any) => {
    const contentType = req.headers["content-type"] || "not set";
    console.log(
      `📎 Multer middleware EXECUTING for field "${field}" (${type})`
    );
    console.log(`   Content-Type: ${contentType}`);
    console.log(`   Method: ${req.method}, Path: ${req.path}`);
    console.log(
      `   Body before multer: ${
        req.body ? `has ${Object.keys(req.body).length} keys` : "empty/null"
      }`
    );
    console.log(
      `   Body is readable: ${req.readable !== false ? "yes" : "no"}`
    );
    console.log(
      `   Body stream consumed: ${req._readableState?.ended ? "yes" : "no"}`
    );

    // Vérifier que le Content-Type est multipart
    if (contentType && !contentType.includes("multipart/form-data")) {
      console.error(
        `❌ ERROR: Content-Type is not multipart/form-data: ${contentType}`
      );
      console.error(`   Multer will NOT work!`);
      return res.status(400).json({
        error: "Invalid Content-Type",
        message: "Content-Type must be multipart/form-data for file uploads",
        received: contentType,
      });
    }

    // Vérifier si le body a déjà été parsé (ce qui empêcherait multer de fonctionner)
    if (req.body && Object.keys(req.body).length > 0 && !req.body._multer) {
      console.error(`❌ ERROR: req.body already has data before multer`);
      console.error(
        `   This means the body was already parsed by express.json() or express.urlencoded()`
      );
      console.error(`   Body keys: ${Object.keys(req.body).join(", ")}`);
      console.error(
        `   Multer cannot read the stream if it's already consumed!`
      );
      return res.status(400).json({
        error: "Body already parsed",
        message:
          "The request body was already parsed before multer could process it",
      });
    }

    middleware(req, res, (err: any) => {
      if (err) {
        console.error(`❌ Multer error (${field}):`, err.message);
        console.error(`   Error code: ${err.code}`);
        console.error(`   Error field: ${err.field}`);
        return res.status(400).json({
          error: "Upload error",
          message: err.message,
          code: err.code,
        });
      }

      // Logs détaillés après traitement
      if (type === "multiple") {
        if (req.files && Array.isArray(req.files)) {
          console.log(
            `📎 Multer: ${req.files.length} file(s) received in field "${field}"`
          );
          req.files.forEach((file: any, index: number) => {
            console.log(
              `   File ${index + 1}: ${file.originalname} (${
                file.size
              } bytes, ${file.mimetype})`
            );
          });
        } else {
          console.warn(`⚠️  Multer: req.files is not an array or is missing`);
          console.warn(`   req.files type: ${typeof req.files}`);
          console.warn(`   req.files value:`, req.files);
        }
      } else if (type === "single") {
        if (req.file) {
          console.log(`📎 Multer: 1 file received in field "${field}"`);
          console.log(
            `   File: ${req.file.originalname} (${req.file.size} bytes, ${req.file.mimetype})`
          );
        } else {
          console.warn(`⚠️  Multer: req.file is missing`);
        }
      }

      // Log du body après multer
      if (req.body && Object.keys(req.body).length > 0) {
        console.log(
          `📎 Body fields after multer: ${Object.keys(req.body).join(", ")}`
        );
        Object.keys(req.body).forEach((key) => {
          const value = req.body[key];
          console.log(
            `   - ${key}: ${typeof value} (length: ${
              typeof value === "string" ? value.length : "N/A"
            })`
          );
        });
      } else {
        console.warn(`⚠️  Body is empty after multer`);
      }

      next();
    });
  };
};
