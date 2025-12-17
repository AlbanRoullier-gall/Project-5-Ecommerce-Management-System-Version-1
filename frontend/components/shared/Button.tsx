import React from "react";
import styles from "../../styles/components/Button.module.css";

/**
 * Variante de bouton
 */
export type ButtonVariant =
  | "primary"
  | "secondary"
  | "gold"
  | "outline"
  | "danger";

/**
 * Props du composant Button
 */
interface ButtonProps {
  /** Type de bouton */
  type?: "button" | "submit" | "reset";
  /** Variante du bouton */
  variant?: ButtonVariant;
  /** Contenu du bouton */
  children: React.ReactNode;
  /** Callback appelé lors du clic */
  onClick?: () => void;
  /** Indique si le bouton est désactivé */
  disabled?: boolean;
  /** Indique si le bouton est en chargement */
  isLoading?: boolean;
  /** Icône FontAwesome (optionnelle) */
  icon?: string;
  /** Taille du bouton */
  size?: "small" | "medium" | "large";
  /** Largeur complète */
  fullWidth?: boolean;
}

/**
 * Composant de bouton réutilisable
 * Style uniforme pour tous les boutons avec plusieurs variantes
 * Supporte les icônes FontAwesome, les états hover/disabled et le chargement
 *
 * @example
 * <Button variant="primary" icon="fas fa-plus" onClick={handleClick} isLoading={loading}>
 *   Nouveau produit
 * </Button>
 */
const Button: React.FC<ButtonProps> = ({
  type = "button",
  variant = "primary",
  children,
  onClick,
  disabled = false,
  isLoading = false,
  icon,
  size = "medium",
  fullWidth = false,
}) => {
  const classes = [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth ? styles.fullWidth : "",
    isLoading ? styles.loading : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={classes}
    >
      {isLoading ? (
        <>
          <i className={`fas fa-spinner fa-spin ${styles.icon}`}></i>
          <span>Chargement...</span>
        </>
      ) : (
        <>
          {icon && <i className={`${icon} ${styles.icon}`}></i>}
          <span>{children}</span>
        </>
      )}
    </button>
  );
};

export default Button;
