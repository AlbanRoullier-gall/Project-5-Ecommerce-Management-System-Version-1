/**
 * Service pour les utilisateurs (backoffice)
 * Gère tous les appels API liés aux utilisateurs admin
 */

import { apiClient } from "./apiClient";
import { UserPublicDTO } from "dto";
import { ApiResponse } from "./apiClient";

/**
 * Récupère la liste des utilisateurs
 */
export async function getUsers(
  mode: "pending" | "all"
): Promise<{ users: UserPublicDTO[]; count: number }> {
  const endpoint =
    mode === "pending" ? "/api/admin/users/pending" : "/api/admin/users";

  const response = await apiClient.get<
    ApiResponse<{
      users: UserPublicDTO[];
      count: number;
    }>
  >(endpoint);

  if (!response.data || !Array.isArray(response.data.users)) {
    throw new Error("Format de réponse invalide pour les utilisateurs");
  }

  return {
    users: response.data.users,
    count: response.data.count || response.data.users.length,
  };
}

/**
 * Approuve un utilisateur
 */
export async function approveUser(userId: number): Promise<void> {
  await apiClient.post(`/api/admin/users/${userId}/approve`);
}

/**
 * Rejette un utilisateur
 */
export async function rejectUser(userId: number): Promise<void> {
  await apiClient.post(`/api/admin/users/${userId}/reject`);
}

/**
 * Supprime un utilisateur
 */
export async function deleteUser(userId: number): Promise<void> {
  await apiClient.delete(`/api/admin/users/${userId}`);
}









