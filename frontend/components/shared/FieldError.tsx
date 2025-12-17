import React from "react";
import styles from "../../styles/components/FieldError.module.css";

interface FieldErrorProps {
  message: string;
}

const FieldError: React.FC<FieldErrorProps> = ({ message }) => {
  return (
    <div className={styles.error}>
      <i className={`fas fa-exclamation-circle ${styles.icon}`}></i>
      <span className={styles.text}>{message}</span>
    </div>
  );
};

export default FieldError;
