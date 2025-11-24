import React from "react";

/**
 * Props du composant Button
 */
interface ButtonProps {
  /** Fonction appelée au clic */
  onClick?: () => void;
  /** Type de bouton HTML */
  type?: "button" | "submit" | "reset";
  /** Variante de style du bouton */
  variant?: "primary" | "secondary" | "gold" | "danger";
  /** État désactivé du bouton */
  disabled?: boolean;
  /** Contenu du bouton */
  children: React.ReactNode;
  /** Classe d'icône FontAwesome (optionnel) */
  icon?: string;
}

/**
 * Composant bouton réutilisable avec plusieurs variantes de style
 * Supporte les icônes FontAwesome et les états hover/disabled
 *
 * @example
 * <Button variant="primary" icon="fas fa-plus" onClick={handleClick}>
 *   Nouveau produit
 * </Button>
 */
const Button: React.FC<ButtonProps> = ({
  onClick,
  type = "button",
  variant = "primary",
  disabled = false,
  children,
  icon,
}) => {
  /**
   * Retourne les styles CSS selon la variante du bouton
   * @returns Objet de styles CSS
   */
  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return {
          background: "linear-gradient(135deg, #13686a 0%, #0dd3d1 100%)",
          color: "white",
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
          boxShadow: "0 4px 12px rgba(217, 185, 112, 0.2)",
        };
      case "danger":
        return {
          background: "linear-gradient(135deg, #dc2626 0%, #ef4444 100%)",
          color: "white",
          boxShadow: "0 4px 12px rgba(220, 38, 38, 0.25)",
        };
    }
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        padding: "1rem 2rem",
        border: "none",
        borderRadius: "12px",
        fontSize: "1.1rem",
        fontWeight: "600",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "all 0.3s ease",
        opacity: disabled ? 0.5 : 1,
        ...getVariantStyles(),
      }}
      onMouseOver={(e) => {
        if (!disabled) {
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
      {icon && <i className={icon} style={{ fontSize: "1.1rem" }}></i>}
      <span>{children}</span>
    </button>
  );
};

export default Button;
