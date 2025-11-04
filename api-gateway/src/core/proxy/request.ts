/**
 * Construction des requêtes proxy vers les services
 */

import { Request } from "express";
import FormData from "form-data";
import { AuthenticatedUser } from "../../auth";
import { ServiceName, SERVICES } from "../../config";

/**
 * Construit les headers de base pour la requête proxy
 */
export const buildBaseHeaders = (req: Request): Record<string, string> => {
  const headers: Record<string, string> = {};

  if ((req as any).user) {
    const user = (req as any).user as AuthenticatedUser;
    headers["x-user-id"] = String(user.userId);
    headers["x-user-email"] = user.email;
  }

  return headers;
};

/**
 * Prépare les données multipart/form-data pour le proxy
 */
export const prepareMultipartData = (req: Request): FormData => {
  const formData = new FormData();
  const hasFile = !!(req as any).file;
  const hasFiles = !!(req as any).files;

  console.log("📦 Preparing multipart data:");
  console.log(`   - Has file: ${hasFile}`);
  console.log(`   - Has files: ${hasFiles}`);
  console.log(
    `   - Body keys: ${req.body ? Object.keys(req.body).join(", ") : "none"}`
  );

  // Données du body (doit être AVANT les fichiers pour certains services)
  if (req.body) {
    Object.keys(req.body).forEach((key) => {
      const value = req.body[key];
      // Si la valeur est déjà une string (comme pour "product" qui est JSON stringifié)
      // on l'ajoute telle quelle, sinon on stringifie les objets
      if (typeof value === "string") {
        formData.append(key, value);
        console.log(
          `   - Added body field: ${key} (string, length: ${value.length})`
        );
      } else if (typeof value === "object" && value !== null) {
        const stringified = JSON.stringify(value);
        formData.append(key, stringified);
        console.log(`   - Added body field: ${key} (object, stringified)`);
      } else {
        formData.append(key, String(value));
        console.log(`   - Added body field: ${key} (other: ${typeof value})`);
      }
    });
  }

  // Fichier unique
  if (hasFile) {
    const file = (req as any).file;
    formData.append("image", file.buffer, {
      filename: file.originalname,
      contentType: file.mimetype,
    });
    console.log(`   - Added file: ${file.originalname} (${file.size} bytes)`);
  }

  // Fichiers multiples
  if (hasFiles) {
    const files = (req as any).files as Express.Multer.File[];
    console.log(`   - Adding ${files.length} files to field "images"`);
    files.forEach((file, index) => {
      formData.append("images", file.buffer, {
        filename: file.originalname,
        contentType: file.mimetype,
      });
      console.log(
        `   - Added file ${index + 1}: ${file.originalname} (${
          file.size
        } bytes)`
      );
    });
  }

  return formData;
};

/**
 * Construit la configuration complète pour une requête proxy
 */
export const buildProxyRequest = (
  req: Request,
  service: ServiceName
): {
  url: string;
  headers: Record<string, string>;
  data: any;
  params: any;
} => {
  const serviceUrl = SERVICES[service];
  const targetUrl = `${serviceUrl}${req.path}`;

  const baseHeaders = buildBaseHeaders(req);
  const hasFile = !!(req as any).file;
  const hasFiles = !!(req as any).files;

  let requestData: any;
  let requestHeaders: Record<string, string>;

  if (hasFile || hasFiles) {
    // Validation : vérifier que les données essentielles sont présentes
    if (!req.body || Object.keys(req.body).length === 0) {
      console.error("❌ Error: req.body is empty after multer processing");
      console.error(
        "   This might indicate multer didn't parse the form data correctly"
      );
      console.error("   Headers:", req.headers);
      console.error("   Content-Type:", req.headers["content-type"]);
    } else {
      // Vérifier spécifiquement pour with-images
      if (req.path.includes("/with-images") && !req.body.product) {
        console.error(
          "❌ Error: req.body.product is missing for /with-images route"
        );
        console.error("   Available body keys:", Object.keys(req.body));
      }
    }

    const formData = prepareMultipartData(req);

    requestData = formData;
    // getHeaders() retourne les headers avec le boundary correct pour multipart/form-data
    const formDataHeaders = formData.getHeaders();
    requestHeaders = {
      ...baseHeaders,
      ...formDataHeaders,
    };

    console.log("📤 Sending multipart request to service:");
    console.log(`   URL: ${targetUrl}`);
    console.log(`   Headers: ${Object.keys(requestHeaders).join(", ")}`);
    console.log(
      `   Content-Type: ${formDataHeaders["content-type"] || "not set"}`
    );

    // Ne pas définir Content-Length explicitement pour FormData
    // axios le calculera automatiquement depuis le stream
  } else {
    requestData = req.body;
    requestHeaders = { ...baseHeaders, "Content-Type": "application/json" };
  }

  return {
    url: targetUrl,
    headers: requestHeaders,
    data: requestData,
    params: req.query,
  };
};
