import React, { useState, useEffect } from "react";
import { UserPublicDTO } from "../../../dto";
import { UserTable } from "./";
import ErrorAlert from "../../shared/ErrorAlert";
import LoadingSpinner from "../../shared/LoadingSpinner";
import { useAuth } from "../../../contexts/AuthContext";

/**
 * Props du composant UserList
 */
interface UserListProps {
  /** Mode d'affichage : 'pending' pour les utilisateurs en attente, 'all' pour tous */
  mode: "pending" | "all";
}

/**
 * Composant de liste des utilisateurs
 *
 * Fonctionnalités :
 * - Affichage de la liste des utilisateurs (en attente ou tous)
 * - Actions : approuver, rejeter, supprimer
 * - Gestion des erreurs et chargement
 */
const UserList: React.FC<UserListProps> = ({ mode }) => {
  const { apiCall } = useAuth();

  // États de données
  const [users, setUsers] = useState<UserPublicDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Charger les données au montage du composant
  useEffect(() => {
    loadUsers();
  }, [mode]);

  /**
   * Charge la liste des utilisateurs depuis l'API
   */
  const loadUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const endpoint =
        mode === "pending" ? "/api/admin/users/pending" : "/api/admin/users";
      const data = await apiCall<{
        success: boolean;
        data: {
          users: UserPublicDTO[];
          count: number;
        };
      }>({
        url: endpoint,
        method: "GET",
        requireAuth: true,
      });

      if (data.success && data.data?.users) {
        setUsers(data.data.users);
      } else {
        setError("Format de réponse invalide");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur lors du chargement");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Approuve un utilisateur
   */
  const handleApprove = async (user: UserPublicDTO) => {
    if (!confirm(`Êtes-vous sûr de vouloir approuver ${user.fullName} ?`)) {
      return;
    }

    try {
      await apiCall({
        url: `/api/admin/users/${user.userId}/approve`,
        method: "POST",
        requireAuth: true,
      });
      // Recharger la liste
      await loadUsers();
    } catch (e) {
      alert(
        e instanceof Error
          ? e.message
          : "Erreur lors de l'approbation de l'utilisateur"
      );
    }
  };

  /**
   * Rejette un utilisateur
   */
  const handleReject = async (user: UserPublicDTO) => {
    if (
      !confirm(
        `Êtes-vous sûr de vouloir rejeter ${user.fullName} ? Cette action est irréversible.`
      )
    ) {
      return;
    }

    try {
      await apiCall({
        url: `/api/admin/users/${user.userId}/reject`,
        method: "POST",
        requireAuth: true,
      });
      // Recharger la liste
      await loadUsers();
    } catch (e) {
      alert(
        e instanceof Error ? e.message : "Erreur lors du rejet de l'utilisateur"
      );
    }
  };

  /**
   * Supprime un utilisateur
   */
  const handleDelete = async (userId: number) => {
    if (
      !confirm(
        "Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible."
      )
    ) {
      return;
    }

    try {
      await apiCall({
        url: `/api/admin/users/${userId}`,
        method: "DELETE",
        requireAuth: true,
      });
      // Recharger la liste
      await loadUsers();
    } catch (e) {
      alert(
        e instanceof Error
          ? e.message
          : "Erreur lors de la suppression de l'utilisateur"
      );
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Chargement des utilisateurs..." />;
  }

  return (
    <div>
      {error && <ErrorAlert message={error} onClose={() => setError(null)} />}

      <UserTable
        users={users}
        mode={mode}
        onApprove={mode === "pending" ? handleApprove : undefined}
        onReject={mode === "pending" ? handleReject : undefined}
        onDelete={mode === "all" ? handleDelete : undefined}
      />
    </div>
  );
};

export default UserList;
