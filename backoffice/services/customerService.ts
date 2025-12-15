/**
 * Service pour les clients (backoffice)
 * Gère tous les appels API liés aux clients admin
 */

import { apiClient } from "./apiClient";
import {
  CustomerPublicDTO,
  CustomerCreateDTO,
  CustomerUpdateDTO,
  CustomerListRequestDTO,
  AddressPublicDTO,
  AddressCreateDTO,
  AddressUpdateDTO,
} from "dto";
import { ApiResponse } from "./apiClient";

/**
 * Récupère la liste des clients avec filtres
 */
export async function getCustomers(
  filters?: Partial<CustomerListRequestDTO>
): Promise<{ customers: CustomerPublicDTO[] }> {
  const queryParams = new URLSearchParams();
  if (filters?.search) queryParams.set("search", filters.search);

  const queryString = queryParams.toString();
  const endpoint = queryString
    ? `/api/admin/customers?${queryString}`
    : `/api/admin/customers`;

  const response = await apiClient.get<
    ApiResponse<{ customers: CustomerPublicDTO[] }>
  >(endpoint);

  if (!response.data || !Array.isArray(response.data.customers)) {
    throw new Error("Format de réponse invalide pour les clients");
  }

  return { customers: response.data.customers };
}

/**
 * Récupère un client par son ID
 */
export async function getCustomer(
  customerId: number
): Promise<CustomerPublicDTO> {
  // L'API customer-service retourne le customer directement à la racine
  // Format: { message: "...", customer: {...}, timestamp: "...", status: 200 }
  const response = await apiClient.get<{
    message?: string;
    customer: CustomerPublicDTO;
    timestamp?: string;
    status?: number;
  }>(`/api/admin/customers/${customerId}`);

  if (!response || !response.customer) {
    throw new Error("Format de réponse invalide pour le client");
  }

  return response.customer;
}

/**
 * Crée un client
 */
export async function createCustomer(
  customerData: CustomerCreateDTO
): Promise<CustomerPublicDTO> {
  // L'API customer-service retourne le customer directement à la racine
  // Format: { message: "...", customer: {...}, timestamp: "...", status: 201 }
  const response = await apiClient.post<{
    message?: string;
    customer: CustomerPublicDTO;
    timestamp?: string;
    status?: number;
  }>("/api/admin/customers", customerData);

  if (!response || !response.customer) {
    throw new Error("Format de réponse invalide pour le client créé");
  }

  return response.customer;
}

/**
 * Met à jour un client
 */
export async function updateCustomer(
  customerId: number,
  customerData: CustomerUpdateDTO
): Promise<CustomerPublicDTO> {
  // L'API customer-service retourne le customer directement à la racine
  // Format: { message: "...", customer: {...}, timestamp: "...", status: 200 }
  const response = await apiClient.put<{
    message?: string;
    customer: CustomerPublicDTO;
    timestamp?: string;
    status?: number;
  }>(`/api/admin/customers/${customerId}`, customerData);

  if (!response || !response.customer) {
    throw new Error("Format de réponse invalide pour le client mis à jour");
  }

  return response.customer;
}

/**
 * Supprime un client
 */
export async function deleteCustomer(customerId: number): Promise<void> {
  await apiClient.delete(`/api/admin/customers/${customerId}`);
}

/**
 * Récupère les adresses d'un client
 */
export async function getCustomerAddresses(
  customerId: number
): Promise<{ addresses: AddressPublicDTO[] }> {
  const response = await apiClient.get<
    ApiResponse<{ addresses: AddressPublicDTO[] }>
  >(`/api/admin/customers/${customerId}/addresses`);

  if (!response.data || !Array.isArray(response.data.addresses)) {
    throw new Error("Format de réponse invalide pour les adresses");
  }

  return { addresses: response.data.addresses };
}

/**
 * Crée une adresse pour un client
 */
export async function createCustomerAddress(
  customerId: number,
  addressData: AddressCreateDTO
): Promise<AddressPublicDTO> {
  const response = await apiClient.post<
    ApiResponse<{ address: AddressPublicDTO }>
  >(`/api/admin/customers/${customerId}/addresses`, addressData);

  if (!response.data || !response.data.address) {
    throw new Error("Format de réponse invalide pour l'adresse créée");
  }

  return response.data.address;
}

/**
 * Met à jour une adresse d'un client
 */
export async function updateCustomerAddress(
  customerId: number,
  addressId: number,
  addressData: AddressUpdateDTO
): Promise<AddressPublicDTO> {
  const response = await apiClient.put<
    ApiResponse<{ address: AddressPublicDTO }>
  >(`/api/admin/customers/${customerId}/addresses/${addressId}`, addressData);

  if (!response.data || !response.data.address) {
    throw new Error("Format de réponse invalide pour l'adresse mise à jour");
  }

  return response.data.address;
}

/**
 * Supprime une adresse d'un client
 */
export async function deleteCustomerAddress(
  customerId: number,
  addressId: number
): Promise<void> {
  await apiClient.delete(
    `/api/admin/customers/${customerId}/addresses/${addressId}`
  );
}
