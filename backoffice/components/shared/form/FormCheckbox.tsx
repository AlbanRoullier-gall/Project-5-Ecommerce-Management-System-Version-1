import React from "react";
import styles from "../../../styles/components/FormCheckbox.module.css";

interface FormCheckboxProps {
  id: string;
  name: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
}

const FormCheckbox: React.FC<FormCheckboxProps> = ({
  id,
  name,
  checked,
  onChange,
  label,
}) => {
  return (
    <div className={styles.container}>
      <input
        type="checkbox"
        id={id}
        name={name}
        checked={checked}
        onChange={onChange}
        className={styles.checkbox}
      />
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
    </div>
  );
};

export default FormCheckbox;
