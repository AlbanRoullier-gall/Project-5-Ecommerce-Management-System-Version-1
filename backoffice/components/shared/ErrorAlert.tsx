import React from "react";

/**
 * Props du composant ErrorAlert
 */
interface ErrorAlertProps {
  /** Message d'erreur à afficher */
  message: string;
  /** Callback appelé lors de la fermeture de l'alerte */
  onClose: () => void;
}

/**
 * Composant d'alerte d'erreur
 * Affiche un message d'erreur avec un style visuel distinctif et un bouton de fermeture
 *
 * @example
 * <ErrorAlert
 *   message="Une erreur s'est produite"
 *   onClose={() => setError(null)}
 * />
 */
const ErrorAlert: React.FC<ErrorAlertProps> = ({ message, onClose }) => {
  return (
    <div
      style={{
        background: "linear-gradient(135deg, #fdf2f2 0%, #fef2f2 100%)",
        border: "2px solid #fecaca",
        borderLeft: "4px solid #dc2626",
        color: "#dc2626",
        padding: "1.5rem",
        borderRadius: "12px",
        marginBottom: "1.5rem",
        display: "flex",
        alignItems: "flex-start",
        gap: "1rem",
        boxShadow: "0 4px 12px rgba(220, 38, 38, 0.1)",
        animation: "slideIn 0.3s ease-out",
      }}
    >
      <i
        className="fas fa-exclamation-circle"
        style={{ fontSize: "1.5rem", marginTop: "0.25rem" }}
      ></i>
      <div style={{ flex: 1 }}>
        <strong
          style={{
            display: "block",
            marginBottom: "0.5rem",
            fontSize: "1.1rem",
          }}
        >
          Erreur
        </strong>
        <span style={{ fontSize: "1rem" }}>{message}</span>
      </div>
      <button
        onClick={onClose}
        style={{
          background: "none",
          border: "none",
          color: "#dc2626",
          cursor: "pointer",
          padding: "0.25rem",
          fontSize: "1.25rem",
        }}
      >
        <i className="fas fa-times"></i>
      </button>
    </div>
  );
};

export default ErrorAlert;

