import React from "react";
import { UserPublicDTO } from "../../../dto";
import TableLayout, {
  TableHeader,
  TableRow,
  TableCell,
} from "../../shared/TableLayout";
import {
  ActionButtonsContainer,
  ActionButton,
} from "../../shared/ActionButton";
import Badge from "../../shared/Badge";

/**
 * Props du composant UserTable
 */
interface UserTableProps {
  /** Liste des utilisateurs à afficher */
  users: UserPublicDTO[];
  /** Callback appelé pour approuver un utilisateur */
  onApprove?: (user: UserPublicDTO) => void;
  /** Callback appelé pour rejeter un utilisateur */
  onReject?: (user: UserPublicDTO) => void;
  /** Callback appelé pour supprimer un utilisateur */
  onDelete?: (userId: number) => void;
  /** Mode d'affichage : 'pending' pour les utilisateurs en attente, 'all' pour tous */
  mode?: "pending" | "all";
}

/**
 * Composant tableau d'utilisateurs
 * Affiche la liste des utilisateurs dans un tableau avec colonnes :
 * - Nom complet
 * - Email
 * - Statut
 * - Date de création
 * - Actions (approuver/rejeter/supprimer selon le mode)
 */
const UserTable: React.FC<UserTableProps> = ({
  users,
  onApprove,
  onReject,
  onDelete,
  mode = "all",
}) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("fr-BE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  const getStatusBadge = (user: UserPublicDTO) => {
    if (user.isBackofficeRejected) {
      return <Badge type="error" label="Rejeté" />;
    }
    if (user.isBackofficeApproved) {
      return <Badge type="success" label="Approuvé" />;
    }
    return <Badge type="warning" label="En attente" />;
  };

  const headers: TableHeader[] = [
    { label: "Nom complet" },
    { label: "Email" },
    { label: "Statut" },
    { label: "Date de création", className: "mobile-hide" },
    { label: "Actions", align: "right", width: "200px" },
  ];

  return (
    <TableLayout headers={headers} minWidth="800px" headerGradient="teal">
      {users.length === 0 && (
        <TableRow>
          <TableCell
            colSpan={5}
            align="center"
            style={{ color: "#6b7280", padding: "2rem" }}
          >
            Aucun utilisateur trouvé
          </TableCell>
        </TableRow>
      )}

      {users.map((user) => (
        <TableRow key={user.userId}>
          <TableCell>
            <div style={{ fontWeight: "600", color: "#1f2937" }}>
              {user.fullName}
            </div>
          </TableCell>
          <TableCell>{user.email}</TableCell>
          <TableCell>{getStatusBadge(user)}</TableCell>
          <TableCell className="mobile-hide">
            {formatDate(user.createdAt)}
          </TableCell>
          <TableCell align="right">
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <ActionButtonsContainer>
                {mode === "pending" && onApprove && (
                  <ActionButton
                    icon="fas fa-check"
                    color="#10b981"
                    title="Approuver"
                    onClick={() => onApprove(user)}
                  />
                )}
                {mode === "pending" && onReject && (
                  <ActionButton
                    icon="fas fa-times"
                    color="#ef4444"
                    title="Rejeter"
                    onClick={() => onReject(user)}
                  />
                )}
                {mode === "all" && onDelete && (
                  <ActionButton
                    icon="fas fa-trash"
                    color="#ef4444"
                    title="Supprimer"
                    onClick={() => onDelete(user.userId)}
                  />
                )}
              </ActionButtonsContainer>
            </div>
          </TableCell>
        </TableRow>
      ))}
    </TableLayout>
  );
};

export default UserTable;
