/**
 * Service pour les commandes (backoffice)
 * Gère tous les appels API liés aux commandes admin
 */

import { apiClient } from "./apiClient";
import {
  OrderPublicDTO,
  OrderListRequestDTO,
  OrderUpdateDeliveryStatusDTO,
  CreditNotePublicDTO,
  CreditNoteListRequestDTO,
  CreditNoteCreateDTO,
  OrderUpdateCreditNoteStatusDTO,
  OrderItemPublicDTO,
  OrderAddressPublicDTO,
} from "dto";
import { ApiResponse } from "./apiClient";

/**
 * Récupère la liste des commandes avec filtres
 */
export async function getOrders(
  filters?: Partial<OrderListRequestDTO>
): Promise<{ orders: OrderPublicDTO[] }> {
  const queryParams = new URLSearchParams();
  if (filters?.search) queryParams.set("search", filters.search);
  if (filters?.year) queryParams.set("year", String(filters.year));
  if (filters?.total) queryParams.set("total", String(filters.total));
  if (filters?.date) queryParams.set("date", filters.date);
  if (filters?.delivered !== undefined)
    queryParams.set("delivered", String(filters.delivered));

  const queryString = queryParams.toString();
  const endpoint = queryString
    ? `/api/admin/orders?${queryString}`
    : `/api/admin/orders`;

  const response = await apiClient.get<
    ApiResponse<{ orders: OrderPublicDTO[] }>
  >(endpoint);

  if (!response.data || !Array.isArray(response.data.orders)) {
    throw new Error("Format de réponse invalide pour les commandes");
  }

  return { orders: response.data.orders };
}

/**
 * Récupère une commande par son ID
 */
export async function getOrder(orderId: number): Promise<OrderPublicDTO> {
  const response = await apiClient.get<ApiResponse<{ order: OrderPublicDTO }>>(
    `/api/admin/orders/${orderId}`
  );

  if (!response.data || !response.data.order) {
    throw new Error("Format de réponse invalide pour la commande");
  }

  return response.data.order;
}

/**
 * Récupère les articles d'une commande
 */
export async function getOrderItems(
  orderId: number
): Promise<OrderItemPublicDTO[]> {
  const response = await apiClient.get<
    ApiResponse<{ orderItems: OrderItemPublicDTO[]; count: number }>
  >(`/api/admin/orders/${orderId}/items`);

  if (!response.data || !Array.isArray(response.data.orderItems)) {
    throw new Error("Format de réponse invalide pour les articles");
  }

  return response.data.orderItems;
}

/**
 * Récupère les adresses d'une commande
 */
export async function getOrderAddresses(
  orderId: number
): Promise<OrderAddressPublicDTO[]> {
  const response = await apiClient.get<
    ApiResponse<{ orderAddresses: OrderAddressPublicDTO[]; count: number }>
  >(`/api/admin/orders/${orderId}/addresses`);

  if (!response.data || !Array.isArray(response.data.orderAddresses)) {
    throw new Error("Format de réponse invalide pour les adresses");
  }

  return response.data.orderAddresses;
}

/**
 * Met à jour le statut de livraison d'une commande
 */
export async function updateDeliveryStatus(
  orderId: number,
  delivered: boolean
): Promise<void> {
  const updateDTO: OrderUpdateDeliveryStatusDTO = { delivered };
  await apiClient.patch(
    `/api/admin/orders/${orderId}/delivery-status`,
    updateDTO
  );
}

/**
 * Récupère la liste des avoirs avec filtres
 */
export async function getCreditNotes(
  filters?: Partial<CreditNoteListRequestDTO>
): Promise<{ creditNotes: CreditNotePublicDTO[] }> {
  const queryParams = new URLSearchParams();
  if (filters?.year) queryParams.set("year", String(filters.year));

  const queryString = queryParams.toString();
  const endpoint = queryString
    ? `/api/admin/credit-notes?${queryString}`
    : `/api/admin/credit-notes`;

  const response = await apiClient.get<
    ApiResponse<{ creditNotes: CreditNotePublicDTO[] }>
  >(endpoint);

  if (!response.data || !Array.isArray(response.data.creditNotes)) {
    throw new Error("Format de réponse invalide pour les avoirs");
  }

  return { creditNotes: response.data.creditNotes };
}

/**
 * Récupère un avoir par son ID
 */
export async function getCreditNote(
  creditNoteId: number
): Promise<CreditNotePublicDTO> {
  const response = await apiClient.get<
    ApiResponse<{ creditNote: CreditNotePublicDTO }>
  >(`/api/admin/credit-notes/${creditNoteId}`);

  if (!response.data || !response.data.creditNote) {
    throw new Error("Format de réponse invalide pour l'avoir");
  }

  return response.data.creditNote;
}

/**
 * Crée un avoir
 */
export async function createCreditNote(
  creditNoteData: CreditNoteCreateDTO
): Promise<CreditNotePublicDTO> {
  const response = await apiClient.post<
    ApiResponse<{ creditNote: CreditNotePublicDTO }>
  >("/api/admin/credit-notes", creditNoteData);

  if (!response.data || !response.data.creditNote) {
    throw new Error("Format de réponse invalide pour l'avoir créé");
  }

  return response.data.creditNote;
}

/**
 * Met à jour le statut d'un avoir
 */
export async function updateCreditNoteStatus(
  creditNoteId: number,
  status: "pending" | "refunded"
): Promise<void> {
  const updateDTO: OrderUpdateCreditNoteStatusDTO = { status };
  await apiClient.patch(
    `/api/admin/credit-notes/${creditNoteId}/status`,
    updateDTO
  );
}

/**
 * Supprime un avoir
 */
export async function deleteCreditNote(creditNoteId: number): Promise<void> {
  await apiClient.delete(`/api/admin/credit-notes/${creditNoteId}`);
}

/**
 * Exporte les commandes d'une année en HTML
 */
export async function exportOrdersYear(year: number): Promise<Blob> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3020";
  // Fallback: utiliser le token stocké pour passer l'auth si le cookie n'est pas envoyé (cross-domain Railway)
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("auth_token")
      : null;

  const headers: HeadersInit = {
    Accept: "application/pdf",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(
    `${API_URL}/api/admin/exports/orders-year/${year}`,
    {
      method: "GET",
      headers,
      credentials: "include",
    }
  );

  if (!response.ok) {
    throw new Error("Erreur lors de l'export");
  }

  return response.blob();
}

/**
 * Exporte la facture d'une commande en HTML
 */
export async function exportOrderInvoice(orderId: number): Promise<Blob> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3020";
  // Fallback: utiliser le token stocké pour passer l'auth si le cookie n'est pas envoyé (cross-domain Railway)
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("auth_token")
      : null;

  const headers: HeadersInit = {
    Accept: "text/html",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(
    `${API_URL}/api/admin/exports/order/${orderId}/invoice`,
    {
      method: "GET",
      headers,
      credentials: "include",
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Erreur lors de l'export de la facture: ${
        errorText || response.statusText
      }`
    );
  }

  return response.blob();
}
