/**
 * Formate un prix en euros (format belge)
 * @param price - Prix à formater
 * @returns Prix formaté (ex: "25,50 €")
 */
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("fr-BE", {
    style: "currency",
    currency: "EUR",
  }).format(price);
};
