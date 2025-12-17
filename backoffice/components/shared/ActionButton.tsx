import React from "react";
import styles from "../../styles/components/ActionButton.module.css";

/**
 * Props du composant ActionButton
 */
interface ActionButtonProps {
  /** Icône FontAwesome à afficher */
  icon: string;
  /** Variante de couleur */
  variant?: "blue" | "green" | "red" | "gold" | "amber";
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
 *   variant="blue"
 *   title="Modifier"
 *   onClick={handleEdit}
 * />
 */
export const ActionButton: React.FC<ActionButtonProps> = ({
  icon,
  variant = "blue",
  title,
  onClick,
}) => {
  const variantClass =
    {
      blue: styles.blue,
      green: styles.green,
      red: styles.red,
      gold: styles.gold,
      amber: styles.amber,
    }[variant] || styles.blue;

  return (
    <button
      onClick={onClick}
      title={title}
      className={`${styles.button} ${variantClass}`}
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
