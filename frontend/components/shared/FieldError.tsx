import React from "react";

/**
 * Props du composant FieldError
 */
interface FieldErrorProps {
  /** Message d'erreur à afficher */
  message: string;
}

/**
 * Composant d'erreur de champ standardisé
 * Utilisé pour afficher les erreurs de validation des champs de formulaire
 * Format uniforme dans tout le checkout
 */
const FieldError: React.FC<FieldErrorProps> = ({ message }) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        marginTop: "0.5rem",
        padding: "0.75rem 1rem",
        background: "#fef2f2",
        border: "1px solid #ef4444",
        borderRadius: "6px",
        fontSize: "1.2rem",
        color: "#991b1b",
      }}
    >
      <i
        className="fas fa-exclamation-circle"
        style={{
          fontSize: "1.1rem",
          color: "#ef4444",
        }}
      ></i>
      <span style={{ margin: 0, lineHeight: "1.4" }}>{message}</span>
    </div>
  );
};

export default FieldError;
