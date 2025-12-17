import React from "react";
import styles from "../../styles/components/Alert.module.css";

export type AlertType = "success" | "error" | "warning" | "info";

interface AlertProps {
  type: AlertType;
  message: string;
  onClose?: () => void;
}

const typeClassMap: Record<AlertType, { className: string; icon: string }> = {
  success: { className: styles.success, icon: "fa-check-circle" },
  error: { className: styles.error, icon: "fa-exclamation-circle" },
  warning: { className: styles.info, icon: "fa-exclamation-triangle" },
  info: { className: styles.info, icon: "fa-info-circle" },
};

const Alert: React.FC<AlertProps> = ({ type, message, onClose }) => {
  const { className, icon } = typeClassMap[type] || typeClassMap.info;

  return (
    <div className={`${styles.alert} ${className}`}>
      <i className={`fas ${icon} ${styles.icon}`}></i>
      <div className={styles.content}>
        <span className={styles.title}>
          {type === "error"
            ? "Erreur"
            : type === "success"
            ? "Succès"
            : type === "warning"
            ? "Attention"
            : "Info"}
        </span>
        <span>{message}</span>
      </div>
      {onClose && (
        <button className={styles.close} onClick={onClose} aria-label="Fermer">
          <i className="fas fa-times"></i>
        </button>
      )}
    </div>
  );
};

export default Alert;
