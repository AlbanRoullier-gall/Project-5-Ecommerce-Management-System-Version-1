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

/**
 * Calcule le prix TTC à partir du prix HT et du taux de TVA
 * @param priceHT - Prix hors taxes
 * @param vatRate - Taux de TVA en pourcentage
 * @returns Prix TTC
 */
export const getPriceWithVat = (priceHT: number, vatRate: number): number => {
  return priceHT * (1 + vatRate / 100);
};
