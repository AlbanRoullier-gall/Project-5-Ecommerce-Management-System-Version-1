import React from "react";
import styles from "../../../styles/components/FormControls.module.css";

interface FormInputProps {
  id?: string;
  name: string;
  type?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  readOnly?: boolean;
  error?: string;
  fullWidth?: boolean;
  step?: string;
  min?: string;
  max?: string;
}

const FormInput: React.FC<FormInputProps> = ({
  id,
  name,
  type = "text",
  value,
  onChange,
  label,
  placeholder,
  required = false,
  readOnly = false,
  error,
  fullWidth = false,
  step,
  min,
  max,
}) => {
  return (
    <div className={`${styles.field} ${fullWidth ? styles.fieldFull : ""}`}>
      {label && (
        <label htmlFor={id || name} className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      <input
        id={id || name}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        readOnly={readOnly}
        className={`${styles.input} ${error ? styles.inputError : ""} ${
          readOnly ? styles.readOnly : ""
        }`}
        step={step}
        min={min}
        max={max}
      />
      {error && <p className={styles.errorText}>⚠️ {error}</p>}
    </div>
  );
};

export default FormInput;
