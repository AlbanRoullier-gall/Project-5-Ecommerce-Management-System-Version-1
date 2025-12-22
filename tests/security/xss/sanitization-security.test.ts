/**
 * Tests de sécurité XSS - Sanitization
 * Vérifie que la sanitization protège correctement contre les attaques XSS
 */

import {
  escapeHtml,
  sanitizeText,
  sanitizeObject,
  sanitizeRequestBody,
} from "@tfe/shared-types/common/sanitize";

describe("XSS Protection - Sanitization", () => {
  describe("escapeHtml", () => {
    it("devrait échapper les caractères HTML spéciaux", () => {
      const malicious = '<script>alert("XSS")</script>';
      const escaped = escapeHtml(malicious);

      expect(escaped).toBe(
        "&lt;script&gt;alert(&quot;XSS&quot;)&lt;&#x2F;script&gt;"
      );
      expect(escaped).not.toContain("<script>");
      expect(escaped).not.toContain("</script>");
    });

    it("devrait échapper tous les caractères dangereux", () => {
      const testCases = [
        { input: "<", expected: "&lt;" },
        { input: ">", expected: "&gt;" },
        { input: "&", expected: "&amp;" },
        { input: '"', expected: "&quot;" },
        { input: "'", expected: "&#x27;" },
        { input: "/", expected: "&#x2F;" },
      ];

      testCases.forEach(({ input, expected }) => {
        expect(escapeHtml(input)).toBe(expected);
      });
    });

    it("devrait gérer les valeurs null et undefined", () => {
      expect(escapeHtml(null)).toBe("");
      expect(escapeHtml(undefined)).toBe("");
      expect(escapeHtml("")).toBe("");
    });
  });

  describe("sanitizeText", () => {
    it("devrait supprimer les balises script", () => {
      const malicious = '<script>alert("XSS")</script>';
      const sanitized = sanitizeText(malicious, false);

      expect(sanitized).not.toContain("<script>");
      expect(sanitized).not.toContain("</script>");
      expect(sanitized).not.toContain("alert");
    });

    it("devrait supprimer les gestionnaires d'événements", () => {
      const testCases = [
        "<div onclick=\"alert('XSS')\">Click me</div>",
        '<img onerror="alert(\'XSS\')" src="x">',
        "<button onmouseover=\"alert('XSS')\">Hover</button>",
      ];

      testCases.forEach((input) => {
        const sanitized = sanitizeText(input, false);
        expect(sanitized).not.toMatch(/on\w+\s*=/i);
      });
    });

    it("devrait supprimer le protocole javascript:", () => {
      const malicious = "<a href=\"javascript:alert('XSS')\">Click</a>";
      const sanitized = sanitizeText(malicious, false);

      expect(sanitized).not.toContain("javascript:");
    });

    it("devrait échapper le HTML quand allowHtml est false", () => {
      const malicious = '<script>alert("XSS")</script>Hello';
      const sanitized = sanitizeText(malicious, false);

      // Devrait être échappé, pas supprimé
      expect(sanitized).toContain("&lt;");
      expect(sanitized).toContain("&gt;");
      expect(sanitized).toContain("Hello");
    });

    it("devrait supprimer les attributs dangereux même si HTML est autorisé", () => {
      const malicious =
        '<img src="x" onerror="alert(\'XSS\')" style="expression(alert(\'XSS\'))">';
      const sanitized = sanitizeText(malicious, true);

      expect(sanitized).not.toMatch(/onerror/i);
      expect(sanitized).not.toMatch(/style\s*=/i);
    });
  });

  describe("sanitizeObject", () => {
    it("devrait sanitizer récursivement tous les champs string", () => {
      const maliciousObject = {
        name: '<script>alert("XSS")</script>',
        description: '<img src="x" onerror="alert(\'XSS\')">',
        price: 100, // Ne devrait pas être modifié
        nested: {
          notes: "<a href=\"javascript:alert('XSS')\">Click</a>",
        },
      };

      const sanitized = sanitizeObject(maliciousObject, undefined, false);

      expect(sanitized.name).not.toContain("<script>");
      expect(sanitized.description).not.toContain("onerror");
      expect(sanitized.price).toBe(100); // Non modifié
      expect(sanitized.nested.notes).not.toContain("javascript:");
    });

    it("devrait sanitizer uniquement les champs spécifiés", () => {
      const object = {
        name: '<script>alert("XSS")</script>',
        safeField: '<script>alert("XSS")</script>',
        description: "<img onerror=\"alert('XSS')\">",
      };

      const sanitized = sanitizeObject(object, ["name", "description"], false);

      expect(sanitized.name).not.toContain("<script>");
      expect(sanitized.description).not.toContain("onerror");
      // safeField ne devrait pas être sanitizé
      expect(sanitized.safeField).toContain("<script>");
    });

    it("devrait gérer les tableaux", () => {
      const maliciousArray = [
        '<script>alert("XSS")</script>',
        { name: "<img onerror=\"alert('XSS')\">" },
        123,
      ];

      const sanitized = sanitizeObject(maliciousArray, undefined, false);

      expect(sanitized[0]).not.toContain("<script>");
      expect(sanitized[1].name).not.toContain("onerror");
      expect(sanitized[2]).toBe(123);
    });
  });

  describe("sanitizeRequestBody", () => {
    it("devrait sanitizer les champs communs dans un body de requête", () => {
      const maliciousBody = {
        name: '<script>alert("XSS")</script>',
        description: '<img src="x" onerror="alert(\'XSS\')">',
        notes: "<a href=\"javascript:alert('XSS')\">Click</a>",
        firstName: "<div onclick=\"alert('XSS')\">John</div>",
        address: "<iframe src=\"javascript:alert('XSS')\"></iframe>",
        price: 100, // Ne devrait pas être modifié
        quantity: 5, // Ne devrait pas être modifié
      };

      const sanitized = sanitizeRequestBody(maliciousBody);

      // Vérifier que tous les champs communs sont sanitizés
      expect(sanitized.name).not.toContain("<script>");
      expect(sanitized.description).not.toContain("onerror");
      expect(sanitized.notes).not.toContain("javascript:");
      expect(sanitized.firstName).not.toContain("onclick");
      expect(sanitized.address).not.toContain("<iframe>");

      // Vérifier que les champs non-textuels ne sont pas modifiés
      expect(sanitized.price).toBe(100);
      expect(sanitized.quantity).toBe(5);
    });

    it("devrait gérer les cas réels d'attaques XSS", () => {
      const realWorldAttacks = [
        '<script>alert("XSS")</script>',
        '<img src=x onerror=alert("XSS")>',
        '<svg onload=alert("XSS")>',
        '<body onload=alert("XSS")>',
        "<iframe src=\"javascript:alert('XSS')\"></iframe>",
        '<input onfocus=alert("XSS") autofocus>',
        '<select onfocus=alert("XSS") autofocus>',
        '<textarea onfocus=alert("XSS") autofocus>',
        '<keygen onfocus=alert("XSS") autofocus>',
        "<video><source onerror=\"alert('XSS')\">",
        '<audio src=x onerror=alert("XSS")>',
        '<details open ontoggle=alert("XSS")>',
        '<marquee onstart=alert("XSS")>',
        "<math><mi//xlink:href=\"data:x,<script>alert('XSS')</script>\">",
      ];

      realWorldAttacks.forEach((attack) => {
        const sanitized = sanitizeText(attack, false);

        // Le contenu ne devrait jamais contenir de balises script ou gestionnaires d'événements
        expect(sanitized).not.toMatch(/<script/i);
        expect(sanitized).not.toMatch(/on\w+\s*=/i);
        expect(sanitized).not.toMatch(/javascript:/i);
      });
    });
  });

  describe("Protection contre les attaques XSS complexes", () => {
    it("devrait protéger contre les encodages multiples", () => {
      const encodedAttacks = [
        '&lt;script&gt;alert("XSS")&lt;/script&gt;',
        '%3Cscript%3Ealert("XSS")%3C/script%3E',
        '&#60;script&#62;alert("XSS")&#60;/script&#62;',
      ];

      encodedAttacks.forEach((attack) => {
        const sanitized = sanitizeText(attack, false);
        // Même si encodé, ne devrait pas contenir de script
        expect(sanitized.toLowerCase()).not.toContain("alert");
      });
    });

    it("devrait protéger contre les injections dans les attributs", () => {
      const attributeInjection = {
        name: 'Product Name" onmouseover="alert(\'XSS\')" data-',
        description: 'Description" style="expression(alert(\'XSS\'))"',
      };

      const sanitized = sanitizeObject(attributeInjection, undefined, false);

      expect(sanitized.name).not.toContain("onmouseover");
      expect(sanitized.description).not.toContain("expression");
    });
  });
});

