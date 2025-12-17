import React from "react";
import styles from "../../../styles/components/FormControls.module.css";

export interface FormSelectOption {
  value: string;
  label: string;
}

interface FormSelectProps {
  id?: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  label?: string;
  options: FormSelectOption[];
  placeholder?: string;
  required?: boolean;
  error?: string;
  fullWidth?: boolean;
}

const FormSelect: React.FC<FormSelectProps> = ({
  id,
  name,
  value,
  onChange,
  label,
  options,
  placeholder,
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
      <select
        id={id || name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className={`${styles.select} ${error ? styles.selectError : ""}`}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
};

export default FormSelect;
