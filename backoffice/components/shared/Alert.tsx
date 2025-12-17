import React from "react";
import styles from "../../styles/components/Alert.module.css";

export type AlertType = "success" | "error" | "warning" | "info";

interface AlertProps {
  type: AlertType;
  message: string;
  onClose?: () => void;
}

const typeClassMap: Record<AlertType, string> = {
  success: styles.success,
  error: styles.error,
  warning: styles.warning,
  info: styles.info,
};

const iconMap: Record<AlertType, string> = {
  success: "fa-check-circle",
  error: "fa-exclamation-circle",
  warning: "fa-exclamation-triangle",
  info: "fa-info-circle",
};

const Alert: React.FC<AlertProps> = ({ type, message, onClose }) => {
  const alertClass = `${styles.alert} ${typeClassMap[type]}`;
  const iconClass = `${styles.icon} fas ${iconMap[type]}`;

  return (
    <div className={alertClass}>
      <div className={styles.body}>
        <i className={iconClass}></i>
        <p className={styles.message}>{message}</p>
      </div>
      {onClose && (
        <button className={styles.close} onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>
      )}
    </div>
  );
};

export default Alert;
