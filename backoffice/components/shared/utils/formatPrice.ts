/**
 * Formate un prix en euros (format belge avec Intl.NumberFormat)
 * @param price - Prix à formater
 * @returns Prix formaté (ex: "25,50 €")
 */
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("fr-BE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(price || 0);
};

/**
 * Formate un montant en euros avec format simple (ex: "25.50 €")
 * Utile pour les cas où on veut un format plus simple sans Intl
 * @param amount - Montant à formater
 * @param decimals - Nombre de décimales (défaut: 2)
 * @returns Montant formaté (ex: "25.50 €")
 */
export const formatAmount = (amount: number, decimals: number = 2): string => {
  return `${Number(amount || 0).toFixed(decimals)} €`;
};

/**
 * Formate une devise avec locale personnalisable
 * @param amount - Montant à formater
 * @param locale - Locale (défaut: "fr-FR")
 * @returns Montant formaté selon la locale
 */
export const formatCurrency = (
  amount: number,
  locale: string = "fr-FR"
): string => {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(amount || 0);
};
