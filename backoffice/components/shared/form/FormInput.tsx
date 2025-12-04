import React from "react";

/**
 * Props du composant FormInput
 */
interface FormInputProps {
  /** ID unique de l'input (optionnel, utilise name si non fourni) */
  id?: string;
  /** Nom de l'input pour le formulaire */
  name: string;
  /** Valeur de l'input */
  value: string | number;
  /** Callback appelé lors du changement de valeur */
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** Label affiché au-dessus de l'input */
  label?: string;
  /** Type d'input HTML (text, number, email, etc.) */
  type?: string;
  /** Texte de placeholder */
  placeholder?: string;
  /** Message d'erreur à afficher */
  error?: string;
  /** Indique si le champ est requis */
  required?: boolean;
  /** Indique si le champ est en lecture seule */
  readOnly?: boolean;
  /** Incrément pour les inputs de type number */
  step?: string;
  /** Valeur minimale pour les inputs de type number */
  min?: string;
  /** Valeur maximale pour les inputs de type number */
  max?: string;
  /** Largeur de la colonne dans la grille (ex: "1 / -1" pour full width) */
  gridColumn?: string;
}

/**
 * Composant d'input de formulaire réutilisable
 * Style uniforme pour tous les inputs avec label, validation et gestion des erreurs
 * Supporte les états focus/blur avec animation et affiche les messages d'erreur
 *
 * @example
 * <FormInput
 *   name="price"
 *   type="number"
 *   value={formData.price}
 *   onChange={handleChange}
 *   label="Prix (€)"
 *   error={errors.price}
 *   required
 *   step="0.01"
 * />
 */
const FormInput: React.FC<FormInputProps> = ({
  id,
  name,
  value,
  onChange,
  label,
  type = "text",
  placeholder,
  error,
  required = false,
  readOnly = false,
  step,
  min,
  max,
  gridColumn,
}) => {
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

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "1.1rem",
    fontWeight: "600",
    color: "#13686a",
    marginBottom: "0.75rem",
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
        type={type}
        id={id || name}
        name={name}
        value={value}
        onChange={onChange}
        style={inputStyle}
        placeholder={placeholder}
        required={required}
        readOnly={readOnly}
        step={step}
        min={min}
        max={max}
        onFocus={(e) => {
          if (!error && !readOnly) {
            e.target.style.borderColor = "#13686a";
            e.target.style.background = "white";
            e.target.style.boxShadow = "0 0 0 3px rgba(19, 104, 106, 0.1)";
          }
        }}
        onBlur={(e) => {
          e.target.style.borderColor = error ? "#dc2626" : "#e1e5e9";
          e.target.style.background = readOnly ? "#f8f9fa" : "#f8f9fa";
          e.target.style.boxShadow = "none";
        }}
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
