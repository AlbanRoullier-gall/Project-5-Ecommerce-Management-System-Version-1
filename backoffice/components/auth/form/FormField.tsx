"use client";

import React from "react";

/**
 * Props du composant FormField
 */
interface FormFieldProps {
  /** Nom du champ */
  name: string;
  /** Type du champ (text, email, password, etc.) */
  type: string;
  /** Label du champ */
  label: string;
  /** Placeholder optionnel */
  placeholder?: string;
  /** Champ requis ou non */
  required?: boolean;
  /** Valeur du champ */
  value: string;
  /** Message d'erreur du champ */
  error?: string;
  /** Callback lors du changement */
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** Champ désactivé ou non */
  disabled?: boolean;
}

/**
 * Composant FormField
 *
 * Affiche un champ de formulaire avec label, input et message d'erreur
 *
 * @example
 * <FormField
 *   name="email"
 *   type="email"
 *   label="Email"
 *   value={email}
 *   onChange={handleChange}
 *   error={errors.email}
 * />
 */
const FormField: React.FC<FormFieldProps> = ({
  name,
  type,
  label,
  placeholder,
  required = false,
  value,
  error,
  onChange,
  disabled = false,
}) => {
  return (
    <div className="form-group">
      <label htmlFor={name} className="form-label">
        {label}
        {required && <span className="required">*</span>}
      </label>
      <input
        type={type}
        id={name}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`form-input ${error ? "error" : ""}`}
        disabled={disabled}
      />
      {error && (
        <div className="error-message-field">
          <i className="fas fa-exclamation-circle"></i>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default FormField;
