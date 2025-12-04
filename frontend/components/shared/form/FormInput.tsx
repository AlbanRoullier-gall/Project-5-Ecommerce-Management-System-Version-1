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
  value: string | number;
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
  /** Incrément pour les inputs de type number */
  step?: string;
  /** Valeur minimale pour les inputs de type number */
  min?: string;
  /** Valeur maximale pour les inputs de type number */
  max?: string;
}

/**
 * Composant d'input de formulaire réutilisable
 * Style uniforme pour tous les inputs avec label, validation et gestion des erreurs
 * Supporte les états focus/blur avec animation et affiche les messages d'erreur
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
  step,
  min,
  max,
}) => {
  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "1.1rem",
    fontWeight: "600",
    color: "#13686a",
    marginBottom: "0.75rem",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "1rem 1.25rem",
    border: `2px solid ${error ? "#dc2626" : "#e1e5e9"}`,
    borderRadius: "10px",
    fontSize: "1rem",
    transition: "all 0.3s ease",
    background: readOnly ? "#f8f9fa" : "#f8f9fa",
    color: readOnly ? "#666" : "#333",
    fontFamily: "inherit",
    boxSizing: "border-box",
    maxWidth: "100%",
    cursor: readOnly ? "not-allowed" : "text",
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (!readOnly && !error) {
      e.currentTarget.style.borderColor = "#13686a";
      e.currentTarget.style.background = "white";
      e.currentTarget.style.boxShadow = "0 0 0 3px rgba(19, 104, 106, 0.1)";
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = error ? "#dc2626" : "#e1e5e9";
    e.currentTarget.style.background = readOnly ? "#f8f9fa" : "#f8f9fa";
    e.currentTarget.style.boxShadow = "none";
  };

  const containerStyle: React.CSSProperties = {
    width: "100%",
    maxWidth: "100%",
    boxSizing: "border-box",
    ...(gridColumn ? { gridColumn } : {}),
  };

  return (
    <div style={containerStyle}>
      {label && (
        <label htmlFor={id || name} style={labelStyle}>
          {label} {required && <span style={{ color: "#dc2626" }}>*</span>}
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
        step={step}
        min={min}
        max={max}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
      {error && (
        <p
          style={{
            marginTop: "0.5rem",
            fontSize: "0.9rem",
            color: "#dc2626",
          }}
        >
          ⚠️ {error}
        </p>
      )}
    </div>
  );
};

export default FormInput;
