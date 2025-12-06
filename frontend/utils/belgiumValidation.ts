/**
 * Validations spécifiques à la Belgique pour les formulaires de checkout
 */

/**
 * Valide un code postal belge (4 chiffres entre 1000 et 9999)
 */
export function validateBelgianPostalCode(postalCode: string): {
  isValid: boolean;
  error?: string;
} {
  if (!postalCode || postalCode.trim().length === 0) {
    return {
      isValid: false,
      error: "Le code postal est requis",
    };
  }

  // Supprimer les espaces
  const cleaned = postalCode.replace(/\s/g, "");

  // Vérifier que c'est exactement 4 chiffres
  if (!/^\d{4}$/.test(cleaned)) {
    return {
      isValid: false,
      error: "Le code postal doit contenir exactement 4 chiffres",
    };
  }

  // Vérifier que c'est entre 1000 et 9999
  const code = parseInt(cleaned, 10);
  if (code < 1000 || code > 9999) {
    return {
      isValid: false,
      error: "Le code postal doit être entre 1000 et 9999",
    };
  }

  return { isValid: true };
}

/**
 * Valide une adresse belge
 */
export function validateBelgianAddress(address: string): {
  isValid: boolean;
  error?: string;
} {
  if (!address || address.trim().length === 0) {
    return {
      isValid: false,
      error: "L'adresse est requise",
    };
  }

  if (address.trim().length < 5) {
    return {
      isValid: false,
      error: "L'adresse doit contenir au moins 5 caractères",
    };
  }

  // Vérifier qu'il y a au moins un chiffre (pour le numéro de rue)
  if (!/\d/.test(address)) {
    return {
      isValid: false,
      error: "L'adresse doit contenir au moins un chiffre (numéro de rue)",
    };
  }

  if (address.length > 200) {
    return {
      isValid: false,
      error: "L'adresse ne peut pas dépasser 200 caractères",
    };
  }

  return { isValid: true };
}

/**
 * Valide une ville belge
 */
export function validateBelgianCity(city: string): {
  isValid: boolean;
  error?: string;
} {
  if (!city || city.trim().length === 0) {
    return {
      isValid: false,
      error: "La ville est requise",
    };
  }

  if (city.trim().length < 2) {
    return {
      isValid: false,
      error: "La ville doit contenir au moins 2 caractères",
    };
  }

  // Permettre lettres, espaces, tirets, apostrophes (pour noms composés)
  if (
    !/^[a-zA-ZàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞŸ\s\-']+$/.test(
      city
    )
  ) {
    return {
      isValid: false,
      error:
        "La ville ne peut contenir que des lettres, espaces, tirets et apostrophes",
    };
  }

  if (city.length > 100) {
    return {
      isValid: false,
      error: "La ville ne peut pas dépasser 100 caractères",
    };
  }

  return { isValid: true };
}

/**
 * Valide un email
 */
export function validateEmail(email: string): {
  isValid: boolean;
  error?: string;
} {
  if (!email || email.trim().length === 0) {
    return {
      isValid: false,
      error: "L'email est requis",
    };
  }

  // Expression régulière pour valider un email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      error: "L'email n'est pas valide",
    };
  }

  if (email.length > 255) {
    return {
      isValid: false,
      error: "L'email ne peut pas dépasser 255 caractères",
    };
  }

  return { isValid: true };
}

/**
 * Valide un prénom ou nom (caractères valides pour noms belges)
 */
export function validateName(
  name: string,
  fieldName: string = "Ce champ"
): {
  isValid: boolean;
  error?: string;
} {
  if (!name || name.trim().length === 0) {
    return {
      isValid: false,
      error: `${fieldName} est requis`,
    };
  }

  if (name.trim().length < 2) {
    return {
      isValid: false,
      error: `${fieldName} doit contenir au moins 2 caractères`,
    };
  }

  // Permettre lettres, espaces, tirets, apostrophes (pour noms composés)
  if (
    !/^[a-zA-ZàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞŸ\s\-']+$/.test(
      name
    )
  ) {
    return {
      isValid: false,
      error: `${fieldName} ne peut contenir que des lettres, espaces, tirets et apostrophes`,
    };
  }

  if (name.length > 100) {
    return {
      isValid: false,
      error: `${fieldName} ne peut pas dépasser 100 caractères`,
    };
  }

  return { isValid: true };
}

/**
 * Valide un numéro de téléphone belge
 * Formats acceptés : +32..., 0..., 0032...
 */
export function validateBelgianPhoneNumber(phoneNumber: string): {
  isValid: boolean;
  error?: string;
} {
  if (!phoneNumber || phoneNumber.trim().length === 0) {
    // Le téléphone est optionnel
    return { isValid: true };
  }

  // Supprimer les espaces, tirets, points
  const cleaned = phoneNumber.replace(/[\s\-\.]/g, "");

  // Format belge : +32 suivi de 8 ou 9 chiffres, ou 0 suivi de 8 ou 9 chiffres, ou 0032 suivi de 8 ou 9 chiffres
  const belgianPhoneRegex = /^(\+32|0|0032)[1-9]\d{7,8}$/;

  if (!belgianPhoneRegex.test(cleaned)) {
    return {
      isValid: false,
      error:
        "Le numéro de téléphone doit être au format belge (ex: +32 123 45 67 89, 0123 45 67 89, 0032 123 45 67 89)",
    };
  }

  return { isValid: true };
}

/**
 * Valide toutes les données d'une adresse belge
 */
export function validateBelgianAddressFields(address: {
  address?: string;
  postalCode?: string;
  city?: string;
}): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  const addressValidation = validateBelgianAddress(address.address || "");
  if (!addressValidation.isValid) {
    errors.address = addressValidation.error || "";
  }

  const postalCodeValidation = validateBelgianPostalCode(
    address.postalCode || ""
  );
  if (!postalCodeValidation.isValid) {
    errors.postalCode = postalCodeValidation.error || "";
  }

  const cityValidation = validateBelgianCity(address.city || "");
  if (!cityValidation.isValid) {
    errors.city = cityValidation.error || "";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Valide toutes les données client pour la Belgique
 */
export function validateBelgianCustomerData(customerData: {
  email?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
}): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  const emailValidation = validateEmail(customerData.email || "");
  if (!emailValidation.isValid) {
    errors.email = emailValidation.error || "";
  }

  if (customerData.firstName) {
    const firstNameValidation = validateName(
      customerData.firstName,
      "Le prénom"
    );
    if (!firstNameValidation.isValid) {
      errors.firstName = firstNameValidation.error || "";
    }
  }

  if (customerData.lastName) {
    const lastNameValidation = validateName(customerData.lastName, "Le nom");
    if (!lastNameValidation.isValid) {
      errors.lastName = lastNameValidation.error || "";
    }
  }

  if (customerData.phoneNumber) {
    const phoneValidation = validateBelgianPhoneNumber(
      customerData.phoneNumber
    );
    if (!phoneValidation.isValid) {
      errors.phoneNumber = phoneValidation.error || "";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
