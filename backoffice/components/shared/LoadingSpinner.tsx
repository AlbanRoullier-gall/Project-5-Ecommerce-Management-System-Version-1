"use client";

import React from "react";

/**
 * Props du composant LoadingSpinner
 */
interface LoadingSpinnerProps {
  /** Message à afficher sous le spinner */
  message?: string;
  /** Taille du spinner en pixels */
  size?: number;
  /** Afficher en plein écran ou inline */
  fullscreen?: boolean;
}

/**
 * Composant LoadingSpinner
 *
 * Affiche un spinner de chargement animé avec un message optionnel
 *
 * @example
 * <LoadingSpinner message="Chargement..." fullscreen />
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = "Vérification de l'authentification...",
  size = 40,
  fullscreen = true,
}) => {
  const containerStyle: React.CSSProperties = fullscreen
    ? {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: "linear-gradient(135deg, #13686a 0%, #0d4f51 100%)",
        color: "white",
        fontSize: "1.2rem",
      }
    : {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "2rem",
        color: "#13686a",
      };

  const spinnerStyle: React.CSSProperties = {
    width: `${size}px`,
    height: `${size}px`,
    border: fullscreen
      ? "4px solid rgba(255,255,255,0.3)"
      : "4px solid rgba(19, 104, 106, 0.3)",
    borderTop: fullscreen ? "4px solid white" : "4px solid #13686a",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "0 auto 1rem",
  };

  return (
    <div style={containerStyle}>
      <div style={{ textAlign: "center" }}>
        <div style={spinnerStyle}></div>
        {message && <p>{message}</p>}
        <style jsx>{`
          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default LoadingSpinner;
