import React from "react";
import styles from "../../styles/components/ActionButton.module.css";

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
  const hex = color.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const hoverBg = `rgba(${r}, ${g}, ${b}, 0.1)`;

  return (
    <button
      onClick={onClick}
      title={title}
      className={styles.button}
      style={{
        ["--btn-color" as string]: color,
        ["--btn-bg-hover" as string]: hoverBg,
      }}
      type="button"
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
  return <div className={styles.container}>{children}</div>;
};

export default ActionButton;
