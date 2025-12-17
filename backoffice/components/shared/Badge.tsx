import React from "react";
import styles from "../../styles/components/Badge.module.css";

/**
 * Type de badge prédéfini
 */
export type BadgeType =
  | "active"
  | "inactive"
  | "success"
  | "warning"
  | "error"
  | "info";

/**
 * Variante de taille du badge
 */
export type BadgeVariant = "default" | "compact";

/**
 * Props du composant Badge
 */
interface BadgeProps {
  /** Type de badge (détermine les couleurs) */
  type: BadgeType;
  /** Texte du badge */
  label: string;
  /** Icône FontAwesome (optionnelle) */
  icon?: string;
  /** Callback appelé lors du clic (optionnel, rend le badge cliquable) */
  onClick?: () => void;
  /** Indique si le badge est désactivé */
  disabled?: boolean;
  /** Variante de taille (default: padding normal, compact: padding réduit pour les tables) */
  variant?: BadgeVariant;
}

/**
 * Composant de badge réutilisable
 * Affiche un badge avec différents types (actif, inactif, succès, avertissement, erreur, info)
 * Peut être cliquable si onClick est fourni
 *
 * @example
 * <Badge type="active" label="Actif" onClick={handleToggle} />
 * <Badge type="success" label="Livré" />
 */
const Badge: React.FC<BadgeProps> = ({
  type,
  label,
  icon,
  onClick,
  disabled = false,
  variant = "default",
}) => {
  const isClickable = onClick && !disabled;
  const isCompact = variant === "compact";
  const classNames = [
    styles.badgeBase,
    styles[type],
    isCompact ? styles.compact : "",
    isClickable ? styles.clickable : "",
    disabled ? styles.disabled : "",
  ]
    .filter(Boolean)
    .join(" ");

  if (onClick) {
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={classNames}
        type="button"
      >
        {icon && <i className={icon}></i>}
        {label}
      </button>
    );
  }

  return (
    <span className={classNames}>
      {icon && <i className={icon}></i>}
      {label}
    </span>
  );
};

export default Badge;
