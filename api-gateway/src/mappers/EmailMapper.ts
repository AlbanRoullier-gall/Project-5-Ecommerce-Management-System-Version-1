/**
 * Mapper pour les transformations de données d'email
 * Transforme les DTOs entre services (mapping simple, pas de logique métier)
 */

import { OrderCompleteDTO } from "../../../shared-types/order-service";

/**
 * Structure des données pour l'email de confirmation de commande
 */
export interface OrderConfirmationEmailData {
  customerEmail: string;
  customerName: string;
  orderId: number;
  orderDate: string;
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    vatRate: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  shippingAddress: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
}

/**
 * Transforme les données de commande en données d'email
 * Mapping simple de structure (pas de logique métier)
 */
export class EmailMapper {
  /**
   * Transforme OrderCompleteDTO et données additionnelles en données d'email
   * @param orderItems Items de la commande
   * @param customerData Données du client
   * @param shippingAddress Adresse de livraison
   * @param totals Totaux (subtotal, tax, total)
   * @param orderId ID de la commande
   * @returns Données formatées pour l'email
   */
  static orderToEmailData(
    orderItems: OrderCompleteDTO["items"],
    customerData: {
      email: string;
      firstName?: string;
      lastName?: string;
    },
    shippingAddress: {
      firstName: string;
      lastName: string;
      address: string;
      city: string;
      postalCode: string;
      country: string;
    },
    totals: {
      subtotal: number;
      tax: number;
      total: number;
    },
    orderId: number
  ): OrderConfirmationEmailData {
    const customerName = `${customerData.firstName || ""} ${
      customerData.lastName || ""
    }`.trim();

    return {
      customerEmail: customerData.email,
      customerName: customerName || "Client",
      orderId,
      orderDate: new Date().toISOString(),
      items: orderItems.map((item) => ({
        name: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPriceTTC,
        totalPrice: item.totalPriceTTC,
        vatRate: item.vatRate,
      })),
      subtotal: totals.subtotal,
      tax: totals.tax,
      total: totals.total,
      shippingAddress,
    };
  }
}
