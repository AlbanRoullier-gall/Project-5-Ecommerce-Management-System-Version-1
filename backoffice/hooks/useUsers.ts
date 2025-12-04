/**
 * Hook personnalisé pour gérer les utilisateurs
 * Centralise la logique de récupération et de gestion des utilisateurs
 */

import { useState, useEffect, useCallback } from "react";
import { UserPublicDTO } from "../dto";
import {
  getUsers,
  approveUser as approveUserService,
  rejectUser as rejectUserService,
  deleteUser as deleteUserService,
} from "../services/userService";
import { executeWithLoading, getErrorMessage } from "../utils";

interface UseUsersReturn {
  users: UserPublicDTO[];
  isLoading: boolean;
  error: string | null;
  loadUsers: () => Promise<void>;
  handleApprove: (user: UserPublicDTO) => Promise<void>;
  handleReject: (user: UserPublicDTO) => Promise<void>;
  handleDelete: (userId: number) => Promise<void>;
  setError: (error: string | null) => void;
}

export function useUsers(mode: "pending" | "all"): UseUsersReturn {
  const [users, setUsers] = useState<UserPublicDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    const result = await executeWithLoading(
      async () => await getUsers(mode),
      setIsLoading,
      setError,
      {
        notFoundMessage: "Utilisateurs introuvables",
        defaultMessage: "Erreur lors du chargement",
      },
      (err) => console.error("Error loading users:", err)
    );

    if (result) {
      setUsers(result.users);
    }
  }, [mode]);

  const handleApprove = useCallback(
    async (user: UserPublicDTO) => {
      try {
        await approveUserService(user.userId);
        await loadUsers();
      } catch (err: unknown) {
        const errorMessage = getErrorMessage(
          err,
          "Utilisateur introuvable",
          "Erreur lors de l'approbation de l'utilisateur"
        );
        setError(errorMessage);
        throw err;
      }
    },
    [loadUsers]
  );

  const handleReject = useCallback(
    async (user: UserPublicDTO) => {
      try {
        await rejectUserService(user.userId);
        await loadUsers();
      } catch (err: unknown) {
        const errorMessage = getErrorMessage(
          err,
          "Utilisateur introuvable",
          "Erreur lors du rejet de l'utilisateur"
        );
        setError(errorMessage);
        throw err;
      }
    },
    [loadUsers]
  );

  const handleDelete = useCallback(
    async (userId: number) => {
      try {
        await deleteUserService(userId);
        await loadUsers();
      } catch (err: unknown) {
        const errorMessage = getErrorMessage(
          err,
          "Utilisateur introuvable",
          "Erreur lors de la suppression de l'utilisateur"
        );
        setError(errorMessage);
        throw err;
      }
    },
    [loadUsers]
  );

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  return {
    users,
    isLoading,
    error,
    loadUsers,
    handleApprove,
    handleReject,
    handleDelete,
    setError,
  };
}
