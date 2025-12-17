import React from "react";
import styles from "../../styles/components/Button.module.css";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "gold"
  | "outline"
  | "danger";

interface ButtonProps {
  type?: "button" | "submit" | "reset";
  variant?: ButtonVariant;
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  icon?: string;
  size?: "small" | "medium" | "large";
  fullWidth?: boolean;
}

const variantClass: Record<ButtonVariant, string> = {
  primary: styles.primary,
  secondary: styles.secondary,
  gold: styles.gold,
  outline: styles.outline,
  danger: styles.danger,
};

const sizeClass: Record<NonNullable<ButtonProps["size"]>, string> = {
  small: styles.small,
  medium: styles.medium,
  large: styles.large,
};

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
  const className = [
    styles.button,
    variantClass[variant],
    sizeClass[size],
    fullWidth ? styles.fullWidth : "",
    disabled || isLoading ? styles.disabled : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={className}
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
