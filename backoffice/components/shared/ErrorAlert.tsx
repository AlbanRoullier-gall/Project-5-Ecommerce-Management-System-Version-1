import React from "react";
import styles from "../../styles/components/ErrorAlert.module.css";

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
    <div className={styles.alert}>
      <i className={`fas fa-exclamation-circle ${styles.icon}`}></i>
      <div className={styles.body}>
        <strong className={styles.title}>Erreur</strong>
        <span className={styles.text}>{message}</span>
      </div>
      <button onClick={onClose} className={styles.close}>
        <i className="fas fa-times"></i>
      </button>
    </div>
  );
};

export default ErrorAlert;
