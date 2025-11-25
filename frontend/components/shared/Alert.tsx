import React from "react";

/**
 * Type d'alerte
 */
export type AlertType = "success" | "error" | "warning" | "info";

/**
 * Props du composant Alert
 */
interface AlertProps {
  /** Type d'alerte */
  type: AlertType;
  /** Message à afficher */
  message: string;
  /** Callback appelé lors de la fermeture (optionnel, rend l'alerte fermable) */
  onClose?: () => void;
}

/**
 * Composant d'alerte réutilisable
 * Affiche des messages de succès, d'erreur, d'avertissement ou d'information
 *
 * @example
 * <Alert type="success" message="Votre message a été envoyé !" />
 * <Alert type="error" message="Une erreur est survenue" onClose={handleClose} />
 */
const Alert: React.FC<AlertProps> = ({ type, message, onClose }) => {
  const getTypeStyles = (): {
    background: string;
    color: string;
    borderColor: string;
    icon: string;
  } => {
    switch (type) {
      case "success":
        return {
          background: "#f0fdf4",
          color: "#166534",
          borderColor: "#22c55e",
          icon: "fa-check-circle",
        };
      case "error":
        return {
          background: "#fef2f2",
          color: "#991b1b",
          borderColor: "#ef4444",
          icon: "fa-exclamation-circle",
        };
      case "warning":
        return {
          background: "#fffbeb",
          color: "#92400e",
          borderColor: "#f59e0b",
          icon: "fa-exclamation-triangle",
        };
      case "info":
        return {
          background: "#eff6ff",
          color: "#1e40af",
          borderColor: "#3b82f6",
          icon: "fa-info-circle",
        };
      default:
        return {
          background: "#f9fafb",
          color: "#374151",
          borderColor: "#6b7280",
          icon: "fa-info-circle",
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div
      style={{
        background: styles.background,
        border: `2px solid ${styles.borderColor}`,
        borderRadius: "8px",
        padding: "1rem 1.5rem",
        marginBottom: "1.5rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "1rem",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          flex: 1,
        }}
      >
        <i
          className={`fas ${styles.icon}`}
          style={{
            fontSize: "1.3rem",
            color: styles.borderColor,
          }}
        ></i>
        <p
          style={{
            margin: 0,
            fontSize: "1.2rem",
            color: styles.color,
            fontWeight: "500",
          }}
        >
          {message}
        </p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: styles.color,
            fontSize: "1.2rem",
            padding: "0.25rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.opacity = "0.7";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.opacity = "1";
          }}
        >
          <i className="fas fa-times"></i>
        </button>
      )}
    </div>
  );
};

export default Alert;
