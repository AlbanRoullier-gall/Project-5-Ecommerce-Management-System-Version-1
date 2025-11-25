import React from "react";

/**
 * Variante de bouton
 */
export type ButtonVariant = "primary" | "secondary" | "outline" | "danger";

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
 * Style uniforme pour tous les boutons du frontend
 *
 * @example
 * <Button variant="primary" onClick={handleSubmit} isLoading={isLoading}>
 *   Valider
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
        };
      case "secondary":
        return {
          background: "#6b7280",
          color: "white",
          border: "none",
        };
      case "outline":
        return {
          background: "transparent",
          color: "#13686a",
          border: "2px solid #13686a",
        };
      case "danger":
        return {
          background: "#ef4444",
          color: "white",
          border: "none",
        };
      default:
        return {
          background: "linear-gradient(135deg, #13686a 0%, #0dd3d1 100%)",
          color: "white",
          border: "none",
        };
    }
  };

  const getSizeStyles = (): React.CSSProperties => {
    switch (size) {
      case "small":
        return { padding: "0.8rem 1.5rem", fontSize: "1.1rem" };
      case "medium":
        return { padding: "1.2rem 3rem", fontSize: "1.3rem" };
      case "large":
        return { padding: "1.5rem 4rem", fontSize: "1.5rem" };
      default:
        return { padding: "1.2rem 3rem", fontSize: "1.3rem" };
    }
  };

  const baseStyle: React.CSSProperties = {
    ...getVariantStyles(),
    ...getSizeStyles(),
    borderRadius: "8px",
    fontWeight: "600",
    cursor: disabled || isLoading ? "not-allowed" : "pointer",
    transition: "all 0.3s ease",
    opacity: disabled || isLoading ? 0.6 : 1,
    width: fullWidth ? "100%" : "auto",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
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
          e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)";
        }
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {isLoading ? (
        <>
          <i className="fas fa-spinner fa-spin"></i>
          Chargement...
        </>
      ) : (
        <>
          {icon && <i className={icon}></i>}
          {children}
        </>
      )}
    </button>
  );
};

export default Button;
