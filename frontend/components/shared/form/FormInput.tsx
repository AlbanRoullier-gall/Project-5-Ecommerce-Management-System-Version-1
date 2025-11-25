import React from "react";

/**
 * Props du composant FormInput
 */
interface FormInputProps {
  /** ID et nom du champ */
  id?: string;
  name: string;
  /** Type d'input */
  type?: string;
  /** Valeur du champ */
  value: string;
  /** Callback appelé lors du changement */
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** Label du champ */
  label?: string;
  /** Placeholder */
  placeholder?: string;
  /** Indique si le champ est requis */
  required?: boolean;
  /** Indique si le champ est en lecture seule */
  readOnly?: boolean;
  /** Message d'erreur */
  error?: string;
  /** Largeur de la colonne dans la grille (ex: "1 / -1" pour full width) */
  gridColumn?: string;
}

/**
 * Composant d'input de formulaire réutilisable
 * Style uniforme pour tous les inputs du frontend
 *
 * @example
 * <FormInput
 *   name="firstName"
 *   label="Prénom"
 *   value={formData.firstName}
 *   onChange={handleChange}
 *   required
 * />
 */
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
  gridColumn,
}) => {
  const labelStyle: React.CSSProperties = {
    display: "block",
    marginBottom: "0.8rem",
    fontSize: "1.3rem",
    fontWeight: "600",
    color: "#333",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "1.2rem",
    fontSize: "1.3rem",
    border: error ? "2px solid #c33" : "2px solid #ddd",
    borderRadius: "8px",
    transition: "border-color 0.3s ease",
    backgroundColor: readOnly ? "#f8f9fa" : "white",
    color: readOnly ? "#666" : "#333",
    cursor: readOnly ? "not-allowed" : "text",
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (!readOnly) {
      e.currentTarget.style.borderColor = "#13686a";
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = error ? "#c33" : "#ddd";
  };

  return (
    <div
      className="checkout-form-group"
      style={gridColumn ? { gridColumn } : undefined}
    >
      {label && (
        <label htmlFor={id || name} style={labelStyle}>
          {label}
          {required && <span style={{ color: "#c33" }}> *</span>}
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
        style={inputStyle}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
      {error && (
        <span
          style={{
            color: "#c33",
            fontSize: "1rem",
            marginTop: "0.5rem",
            display: "block",
          }}
        >
          {error}
        </span>
      )}
    </div>
  );
};

export default FormInput;
