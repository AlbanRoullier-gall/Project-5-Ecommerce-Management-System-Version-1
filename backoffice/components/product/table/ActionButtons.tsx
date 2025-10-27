import React from "react";

/**
 * Props du composant ActionButtons
 */
interface ActionButtonsProps {
  /** Callback appelé lors du clic sur le bouton Modifier */
  onEdit: () => void;
  /** Callback appelé lors du clic sur le bouton Supprimer */
  onDelete: () => void;
}

/**
 * Composant des boutons d'action pour une ligne de tableau
 * Affiche les boutons Modifier (bleu) et Supprimer (rouge) avec effet hover
 *
 * @example
 * <ActionButtons
 *   onEdit={() => handleEdit(product)}
 *   onDelete={() => handleDelete(product.id)}
 * />
 */
const ActionButtons: React.FC<ActionButtonsProps> = ({ onEdit, onDelete }) => {
  return (
    <div
      className="action-buttons"
      style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}
    >
      {/* Bouton Modifier */}
      <button
        onClick={onEdit}
        title="Modifier"
        className="action-btn action-btn-edit"
        style={{
          padding: "0.75rem",
          border: "none",
          background: "none",
          cursor: "pointer",
          color: "#3b82f6",
          transition: "all 0.2s ease",
          borderRadius: "8px",
          fontSize: "1.2rem",
          minWidth: "44px",
          minHeight: "44px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.background = "rgba(59, 130, 246, 0.1)";
          e.currentTarget.style.transform = "scale(1.1)";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = "none";
          e.currentTarget.style.transform = "scale(1)";
        }}
      >
        <i className="fas fa-edit"></i>
      </button>

      {/* Bouton Supprimer */}
      <button
        onClick={onDelete}
        title="Supprimer"
        className="action-btn action-btn-delete"
        style={{
          padding: "0.75rem",
          border: "none",
          background: "none",
          cursor: "pointer",
          color: "#ef4444",
          transition: "all 0.2s ease",
          borderRadius: "8px",
          fontSize: "1.2rem",
          minWidth: "44px",
          minHeight: "44px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)";
          e.currentTarget.style.transform = "scale(1.1)";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = "none";
          e.currentTarget.style.transform = "scale(1)";
        }}
      >
        <i className="fas fa-trash"></i>
      </button>
    </div>
  );
};

export default ActionButtons;
