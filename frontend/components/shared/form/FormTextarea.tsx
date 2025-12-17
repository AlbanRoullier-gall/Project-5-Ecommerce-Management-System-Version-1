import React from "react";
import styles from "../../../styles/components/FormControls.module.css";

interface FormTextareaProps {
  id?: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  label?: string;
  placeholder?: string;
  rows?: number;
  required?: boolean;
  error?: string;
  fullWidth?: boolean;
}

const FormTextarea: React.FC<FormTextareaProps> = ({
  id,
  name,
  value,
  onChange,
  label,
  placeholder,
  rows = 4,
  required = false,
  error,
  fullWidth = false,
}) => {
  return (
    <div className={`${styles.field} ${fullWidth ? styles.fieldFull : ""}`}>
      {label && (
        <label htmlFor={id || name} className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      <textarea
        id={id || name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        rows={rows}
        className={`${styles.textarea} ${error ? styles.textareaError : ""}`}
      />
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
};

export default FormTextarea;
