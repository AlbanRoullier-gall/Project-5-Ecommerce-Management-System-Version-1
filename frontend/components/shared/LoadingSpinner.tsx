"use client";

import React from "react";

/**
 * Props du composant LoadingSpinner
 */
interface LoadingSpinnerProps {
  /** Message à afficher sous le spinner */
  message?: string;
  /** Taille du spinner (nommée ou en pixels) */
  size?: "small" | "medium" | "large" | number;
  /** Afficher en plein écran ou inline */
  fullscreen?: boolean;
}

/**
 * Composant LoadingSpinner
 *
 * Affiche un spinner de chargement animé avec un message optionnel
 * Supporte les tailles nommées (small, medium, large) ou une taille personnalisée en pixels
 *
 * @example
 * <LoadingSpinner message="Chargement..." fullscreen size="medium" />
 * <LoadingSpinner message="Chargement..." size={50} />
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = "Chargement...",
  size = "medium",
  fullscreen = false,
}) => {
  // Convertir la taille en pixels
  const getSizeInPixels = (): string => {
    if (typeof size === "number") {
      return `${size}px`;
    }
    const sizeMap = {
      small: "1.5rem",
      medium: "2rem",
      large: "3rem",
    };
    return sizeMap[size];
  };

  const sizeInPixels = getSizeInPixels();

  const containerStyle: React.CSSProperties = fullscreen
    ? {
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: "linear-gradient(135deg, #13686a 0%, #0d4f51 100%)",
        color: "white",
        gap: "1rem",
      }
    : {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1rem",
        padding: "2rem",
      };

  return (
    <div style={containerStyle}>
      <i
        className="fas fa-spinner fa-spin"
        style={{
          fontSize: sizeInPixels,
          color: fullscreen ? "white" : "#13686a",
        }}
      ></i>
      {message && (
        <p
          style={{
            fontSize: "1.2rem",
            color: fullscreen ? "white" : "#6b7280",
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
