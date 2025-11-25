import React from "react";

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
  const getBadgeStyles = (badgeType: BadgeType) => {
    switch (badgeType) {
      case "active":
      case "success":
        return {
          background: "linear-gradient(135deg, #10b981 0%, #34d399 100%)",
          boxShadow: "0 2px 8px rgba(16, 185, 129, 0.3)",
        };
      case "inactive":
      case "error":
        return {
          background: "linear-gradient(135deg, #ef4444 0%, #f87171 100%)",
          boxShadow: "0 2px 8px rgba(239, 68, 68, 0.3)",
        };
      case "warning":
        return {
          background: "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)",
          boxShadow: "0 2px 8px rgba(245, 158, 11, 0.3)",
        };
      case "info":
        return {
          background: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
          boxShadow: "0 2px 8px rgba(59, 130, 246, 0.3)",
        };
      default:
        return {
          background: "linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)",
          boxShadow: "0 2px 8px rgba(107, 114, 128, 0.3)",
        };
    }
  };

  const styles = getBadgeStyles(type);
  const isClickable = onClick && !disabled;

  const isCompact = variant === "compact";
  const baseStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: isCompact ? "0.25rem" : "0.5rem",
    padding: isCompact ? "0.25rem 0.75rem" : "0.5rem 1.25rem",
    borderRadius: isCompact ? "6px" : "20px",
    fontSize: isCompact ? "0.9rem" : "0.9rem",
    fontWeight: isCompact ? "500" : "600",
    cursor: isClickable ? "pointer" : "default",
    border: "none",
    transition: "all 0.3s ease",
    background: styles.background,
    color: "white",
    boxShadow: styles.boxShadow,
    opacity: disabled ? 0.6 : 1,
  };

  if (onClick) {
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        style={baseStyle}
        onMouseOver={(e) => {
          if (!disabled) {
            e.currentTarget.style.transform = "translateY(-1px)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.2)";
          }
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = styles.boxShadow;
        }}
      >
        {icon && <i className={icon}></i>}
        {label}
      </button>
    );
  }

  return (
    <span style={baseStyle}>
      {icon && <i className={icon}></i>}
      {label}
    </span>
  );
};

export default Badge;
