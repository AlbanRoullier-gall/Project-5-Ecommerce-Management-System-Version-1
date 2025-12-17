import React from "react";

/**
 * Props du composant ActionButton
 */
interface ActionButtonProps {
  /** Icône FontAwesome à afficher */
  icon: string;
  /** Couleur du bouton */
  color: string;
  /** Tooltip du bouton */
  title: string;
  /** Callback appelé lors du clic */
  onClick: () => void;
}

/**
 * Composant de bouton d'action réutilisable
 * Utilisé dans tous les tableaux pour garantir une cohérence visuelle
 *
 * @example
 * <ActionButton
 *   icon="fas fa-edit"
 *   color="#3b82f6"
 *   title="Modifier"
 *   onClick={handleEdit}
 * />
 */
export const ActionButton: React.FC<ActionButtonProps> = ({
  icon,
  color,
  title,
  onClick,
}) => {
  const getHoverBackground = (buttonColor: string) => {
    // Convert hex color to rgba for hover effect
    const hex = buttonColor.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, 0.1)`;
  };

  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        padding: "0.75rem",
        border: "none",
        background: "none",
        cursor: "pointer",
        color: color,
        transition: "all 0.2s ease",
        borderRadius: "8px",
        fontSize: "1.2rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.background = getHoverBackground(color);
        e.currentTarget.style.transform = "scale(1.1)";
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.background = "none";
        e.currentTarget.style.transform = "scale(1)";
      }}
    >
      <i className={icon}></i>
    </button>
  );
};

/**
 * Container pour les boutons d'action
 * Wrapper standardisé pour tous les groupes de boutons d'action
 */
interface ActionButtonsContainerProps {
  /** Enfants (boutons d'action) */
  children: React.ReactNode;
}

export const ActionButtonsContainer: React.FC<ActionButtonsContainerProps> = ({
  children,
}) => {
  return (
    <div
      style={{
        display: "flex",
        gap: "0.75rem",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
      }}
    >
      {children}
    </div>
  );
};

export default ActionButton;
