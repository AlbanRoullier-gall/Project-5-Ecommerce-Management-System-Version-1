import React from "react";

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
  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case "primary":
        return {
          background: "linear-gradient(135deg, #13686a 0%, #0dd3d1 100%)",
          color: "white",
          border: "none",
          boxShadow: "0 4px 12px rgba(19, 104, 106, 0.2)",
        };
      case "secondary":
        return {
          border: "2px solid #e1e5e9",
          background: "white",
          color: "#6b7280",
          boxShadow: "none",
        };
      case "gold":
        return {
          background: "linear-gradient(135deg, #d9b970 0%, #f4d03f 100%)",
          color: "#13686a",
          border: "none",
          boxShadow: "0 4px 12px rgba(217, 185, 112, 0.2)",
        };
      case "outline":
        return {
          background: "transparent",
          color: "#13686a",
          border: "2px solid #13686a",
          boxShadow: "none",
        };
      case "danger":
        return {
          background: "linear-gradient(135deg, #dc2626 0%, #ef4444 100%)",
          color: "white",
          border: "none",
          boxShadow: "0 4px 12px rgba(220, 38, 38, 0.25)",
        };
      default:
        return {
          background: "linear-gradient(135deg, #13686a 0%, #0dd3d1 100%)",
          color: "white",
          border: "none",
          boxShadow: "0 4px 12px rgba(19, 104, 106, 0.2)",
        };
    }
  };

  const getSizeStyles = (): React.CSSProperties => {
    switch (size) {
      case "small":
        return { padding: "0.8rem 1.5rem", fontSize: "1rem" };
      case "medium":
        return { padding: "1rem 2rem", fontSize: "1.1rem" };
      case "large":
        return { padding: "1.2rem 2.5rem", fontSize: "1.2rem" };
      default:
        return { padding: "1rem 2rem", fontSize: "1.1rem" };
    }
  };

  const baseStyle: React.CSSProperties = {
    ...getVariantStyles(),
    ...getSizeStyles(),
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.75rem",
    borderRadius: "12px",
    fontWeight: "600",
    cursor: disabled || isLoading ? "not-allowed" : "pointer",
    transition: "all 0.3s ease",
    opacity: disabled || isLoading ? 0.6 : 1,
    width: fullWidth ? "100%" : "auto",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      style={baseStyle}
      onMouseOver={(e) => {
        if (!disabled && !isLoading) {
          e.currentTarget.style.transform = "translateY(-2px)";
          if (variant === "primary") {
            e.currentTarget.style.boxShadow =
              "0 8px 24px rgba(19, 104, 106, 0.35)";
          } else if (variant === "gold") {
            e.currentTarget.style.boxShadow =
              "0 8px 24px rgba(217, 185, 112, 0.35)";
          } else if (variant === "danger") {
            e.currentTarget.style.boxShadow =
              "0 8px 24px rgba(220, 38, 38, 0.35)";
          } else if (variant === "outline") {
            e.currentTarget.style.boxShadow =
              "0 4px 12px rgba(19, 104, 106, 0.15)";
          } else {
            e.currentTarget.style.borderColor = "#13686a";
            e.currentTarget.style.color = "#13686a";
            e.currentTarget.style.background = "#f8f9fa";
          }
        }
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        const styles = getVariantStyles();
        e.currentTarget.style.boxShadow = styles.boxShadow || "none";
        if (variant === "secondary") {
          e.currentTarget.style.borderColor = "#e1e5e9";
          e.currentTarget.style.color = "#6b7280";
          e.currentTarget.style.background = "white";
        }
      }}
    >
      {isLoading ? (
        <>
          <i
            className="fas fa-spinner fa-spin"
            style={{ fontSize: "1.1rem" }}
          ></i>
          <span>Chargement...</span>
        </>
      ) : (
        <>
          {icon && <i className={icon} style={{ fontSize: "1.1rem" }}></i>}
          <span>{children}</span>
        </>
      )}
    </button>
  );
};

export default Button;
