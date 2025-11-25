import React from "react";

/**
 * Props du composant FormInput
 */
interface FormInputProps {
  /** ID unique de l'input */
  id: string;
  /** Nom de l'input pour le formulaire */
  name: string;
  /** Valeur de l'input */
  value: string | number;
  /** Callback appelé lors du changement de valeur */
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** Label affiché au-dessus de l'input */
  label: string;
  /** Type d'input HTML (text, number, email, etc.) */
  type?: string;
  /** Texte de placeholder */
  placeholder?: string;
  /** Message d'erreur à afficher */
  error?: string;
  /** Indique si le champ est requis */
  required?: boolean;
  /** Incrément pour les inputs de type number */
  step?: string;
  /** Valeur minimale pour les inputs de type number */
  min?: string;
  /** Valeur maximale pour les inputs de type number */
  max?: string;
}

/**
 * Composant input de formulaire avec label, validation et gestion des erreurs
 * Supporte les états focus/blur avec animation et affiche les messages d'erreur
 *
 * @example
 * <FormInput
 *   id="price"
 *   name="price"
 *   type="number"
 *   value={formData.price}
 *   onChange={handleChange}
 *   label="Prix (€)"
 *   error={errors.price}
 *   required
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
  step,
  min,
  max,
}) => {
  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "1rem 1.25rem",
    border: "2px solid #e1e5e9",
    borderRadius: "10px",
    fontSize: "1rem",
    transition: "all 0.3s ease",
    background: "#f8f9fa",
    fontFamily: "inherit",
    boxSizing: "border-box",
    maxWidth: "100%",
    borderColor: error ? "#dc2626" : "#e1e5e9",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "1.1rem",
    fontWeight: "600",
    color: "#13686a",
    marginBottom: "0.75rem",
  };

  return (
    <div style={{ width: "100%", maxWidth: "100%", boxSizing: "border-box" }}>
      <label htmlFor={id} style={labelStyle}>
        {label} {required && "*"}
      </label>
      <input
        type={type}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        style={inputStyle}
        placeholder={placeholder}
        step={step}
        min={min}
        max={max}
        onFocus={(e) => {
          if (!error) {
            e.target.style.borderColor = "#13686a";
            e.target.style.background = "white";
            e.target.style.boxShadow = "0 0 0 3px rgba(19, 104, 106, 0.1)";
          }
        }}
        onBlur={(e) => {
          e.target.style.borderColor = error ? "#dc2626" : "#e1e5e9";
          e.target.style.background = "#f8f9fa";
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
