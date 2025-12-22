/**
 * Utilitaires de sanitization pour la protection XSS
 * Utilitaire partagé pour sanitizer les entrées utilisateur à travers la plateforme
 */

/**
 * Échappe les caractères HTML spéciaux pour prévenir les attaques XSS
 * Convertit <, >, &, ", ' en leurs équivalents d'entités HTML
 */
export function escapeHtml(text: string | null | undefined): string {
  if (!text || typeof text !== "string") {
    return "";
  }

  const map: { [key: string]: string } = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "/": "&#x2F;",
  };

  return text.replace(/[&<>"'/]/g, (char) => map[char] || char);
}

/**
 * Sanitize une chaîne de caractères en supprimant les balises HTML et attributs potentiellement dangereux
 * Il s'agit d'une sanitization basique - pour la production, envisagez d'utiliser une bibliothèque comme DOMPurify
 *
 * @param text - Le texte à sanitizer
 * @param allowHtml - Indique si les balises HTML sont autorisées (par défaut: false)
 * @returns Texte sanitizé
 */
export function sanitizeText(
  text: string | null | undefined,
  allowHtml: boolean = false
): string {
  if (!text || typeof text !== "string") {
    return "";
  }

  // Si HTML n'est pas autorisé, échapper tout le HTML
  if (!allowHtml) {
    return escapeHtml(text);
  }

  // Suppression basique des balises HTML (pour une sanitization plus avancée, utilisez DOMPurify)
  // Supprime les balises script et les gestionnaires d'événements
  let sanitized = text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "") // Supprime les gestionnaires d'événements comme onclick="..."
    .replace(/on\w+\s*=\s*[^\s>]*/gi, "") // Supprime les gestionnaires d'événements sans guillemets
    .replace(/javascript:/gi, "") // Supprime le protocole javascript:
    .replace(/data:text\/html/gi, ""); // Supprime data:text/html

  // Supprime les attributs dangereux
  sanitized = sanitized.replace(
    /\s*(on\w+|href|src|style)\s*=\s*["'][^"']*["']/gi,
    ""
  );

  return sanitized.trim();
}

/**
 * Sanitize un objet récursivement, en sanitizant toutes les valeurs de type string
 * Utile pour sanitizer les corps de requête avant traitement
 *
 * @param obj - L'objet à sanitizer
 * @param fieldsToSanitize - Liste optionnelle des noms de champs à sanitizer (si non fournie, sanitize toutes les strings)
 * @param allowHtml - Indique si HTML est autorisé dans les champs sanitizés (par défaut: false)
 * @returns Objet sanitizé
 */
export function sanitizeObject<T extends Record<string, any>>(
  obj: T,
  fieldsToSanitize?: string[],
  allowHtml: boolean = false
): T {
  if (!obj || typeof obj !== "object") {
    return obj;
  }

  // Gère les tableaux
  if (Array.isArray(obj)) {
    return obj.map((item) =>
      typeof item === "string"
        ? sanitizeText(item, allowHtml)
        : typeof item === "object"
        ? sanitizeObject(item, fieldsToSanitize, allowHtml)
        : item
    ) as any;
  }

  const sanitized: any = {};

  for (const [key, value] of Object.entries(obj)) {
    // Si fieldsToSanitize est fourni, sanitizer uniquement ces champs
    // Sinon, sanitizer tous les champs de type string
    const shouldSanitize = !fieldsToSanitize || fieldsToSanitize.includes(key);

    if (typeof value === "string" && shouldSanitize) {
      sanitized[key] = sanitizeText(value, allowHtml);
    } else if (typeof value === "object" && value !== null) {
      sanitized[key] = sanitizeObject(value, fieldsToSanitize, allowHtml);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized as T;
}

/**
 * Liste des champs qui contiennent couramment du contenu généré par l'utilisateur et doivent être sanitizés
 * Ce sont les champs les plus vulnérables aux attaques XSS
 */
export const COMMON_SANITIZE_FIELDS = [
  "name",
  "description",
  "notes",
  "reason",
  "comment",
  "message",
  "content",
  "text",
  "title",
  "address",
  "city",
  "firstName",
  "lastName",
  "phoneNumber",
] as const;

/**
 * Sanitize les champs d'entrée utilisateur courants dans un corps de requête
 * Fonction de commodité qui sanitize les champs les plus courants
 *
 * @param body - Le corps de requête à sanitizer
 * @returns Corps de requête sanitizé
 */
export function sanitizeRequestBody<T extends Record<string, any>>(body: T): T {
  return sanitizeObject(body, [...COMMON_SANITIZE_FIELDS] as string[], false);
}

