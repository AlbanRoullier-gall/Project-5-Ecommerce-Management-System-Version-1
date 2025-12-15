import React from "react";
import { UserPublicDTO } from "dto";
import { UserTable } from "./";
import ErrorAlert from "../../shared/ErrorAlert";
import LoadingSpinner from "../../shared/LoadingSpinner";
import { useUsers } from "../../../hooks";

/**
 * Props du composant UserList
 */
interface UserListProps {
  /** Mode d'affichage : 'pending' pour les utilisateurs en attente, 'all' pour tous */
  mode: "pending" | "all";
}

/**
 * Composant d'affichage de la liste des utilisateurs
 * Toute la logique métier est gérée par le hook useUsers
 */
const UserList: React.FC<UserListProps> = ({ mode }) => {
  const {
    users,
    isLoading,
    error,
    handleApprove,
    handleReject,
    handleDelete,
    setError,
  } = useUsers(mode);

  /**
   * Gère l'approbation d'un utilisateur avec confirmation
   */
  const handleApproveUser = async (user: UserPublicDTO) => {
    if (!confirm(`Êtes-vous sûr de vouloir approuver ${user.fullName} ?`)) {
      return;
    }
    try {
      await handleApprove(user);
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Erreur lors de l'approbation de l'utilisateur"
      );
    }
  };

  /**
   * Gère le rejet d'un utilisateur avec confirmation
   */
  const handleRejectUser = async (user: UserPublicDTO) => {
    if (
      !confirm(
        `Êtes-vous sûr de vouloir rejeter ${user.fullName} ? Cette action est irréversible.`
      )
    ) {
      return;
    }
    try {
      await handleReject(user);
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Erreur lors du rejet de l'utilisateur"
      );
    }
  };

  /**
   * Gère la suppression d'un utilisateur avec confirmation
   */
  const handleDeleteUser = async (userId: number) => {
    if (
      !confirm(
        "Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible."
      )
    ) {
      return;
    }
    try {
      await handleDelete(userId);
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
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
        onApprove={mode === "pending" ? handleApproveUser : undefined}
        onReject={mode === "pending" ? handleRejectUser : undefined}
        onDelete={mode === "all" ? handleDeleteUser : undefined}
      />
    </div>
  );
};

export default UserList;
