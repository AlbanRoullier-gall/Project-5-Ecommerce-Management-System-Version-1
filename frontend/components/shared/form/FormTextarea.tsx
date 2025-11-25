import React from "react";

/**
 * Props du composant FormTextarea
 */
interface FormTextareaProps {
  /** ID et nom du champ */
  id?: string;
  name: string;
  /** Valeur du champ */
  value: string;
  /** Callback appelé lors du changement */
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  /** Label du champ */
  label?: string;
  /** Placeholder */
  placeholder?: string;
  /** Nombre de lignes */
  rows?: number;
  /** Indique si le champ est requis */
  required?: boolean;
  /** Message d'erreur */
  error?: string;
  /** Largeur de la colonne dans la grille */
  gridColumn?: string;
}

/**
 * Composant de textarea de formulaire réutilisable
 *
 * @example
 * <FormTextarea
 *   name="message"
 *   label="Message"
 *   value={formData.message}
 *   onChange={handleChange}
 *   rows={5}
 *   required
 * />
 */
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
  gridColumn,
}) => {
  const labelStyle: React.CSSProperties = {
    display: "block",
    marginBottom: "0.8rem",
    fontSize: "1.3rem",
    fontWeight: "600",
    color: "#333",
  };

  const textareaStyle: React.CSSProperties = {
    width: "100%",
    padding: "1.2rem",
    fontSize: "1.3rem",
    border: error ? "2px solid #c33" : "2px solid #ddd",
    borderRadius: "8px",
    transition: "border-color 0.3s ease",
    fontFamily: "inherit",
    resize: "vertical",
  };

  const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = "#13686a";
  };

  const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
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
      <textarea
        id={id || name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        rows={rows}
        style={textareaStyle}
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

export default FormTextarea;
