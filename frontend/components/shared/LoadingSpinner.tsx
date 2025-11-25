import React from "react";

/**
 * Props du composant LoadingSpinner
 */
interface LoadingSpinnerProps {
  /** Message à afficher */
  message?: string;
  /** Taille du spinner */
  size?: "small" | "medium" | "large";
}

/**
 * Composant de spinner de chargement réutilisable
 *
 * @example
 * <LoadingSpinner message="Chargement en cours..." />
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = "Chargement...",
  size = "medium",
}) => {
  const sizeMap = {
    small: "1.5rem",
    medium: "2rem",
    large: "3rem",
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1rem",
        padding: "2rem",
      }}
    >
      <i
        className="fas fa-spinner fa-spin"
        style={{
          fontSize: sizeMap[size],
          color: "#13686a",
        }}
      ></i>
      {message && (
        <p
          style={{
            fontSize: "1.2rem",
            color: "#6b7280",
            margin: 0,
          }}
        >
          {message}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;
