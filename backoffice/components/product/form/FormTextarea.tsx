import React from "react";

/**
 * Props du composant FormTextarea
 */
interface FormTextareaProps {
  /** ID unique du textarea */
  id: string;
  /** Nom du textarea pour le formulaire */
  name: string;
  /** Valeur du textarea */
  value: string;
  /** Callback appelé lors du changement de valeur */
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  /** Label affiché au-dessus du textarea */
  label: string;
  /** Texte de placeholder */
  placeholder?: string;
  /** Message d'erreur à afficher */
  error?: string;
  /** Nombre de lignes visible */
  rows?: number;
}

/**
 * Composant textarea de formulaire avec label et gestion des erreurs
 * Supporte les états focus/blur avec animation
 *
 * @example
 * <FormTextarea
 *   id="description"
 *   name="description"
 *   value={formData.description}
 *   onChange={handleChange}
 *   label="Description"
 *   rows={4}
 * />
 */
const FormTextarea: React.FC<FormTextareaProps> = ({
  id,
  name,
  value,
  onChange,
  label,
  placeholder,
  error,
  rows = 4,
}) => {
  const textareaStyle: React.CSSProperties = {
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
        {label}
      </label>
      <textarea
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        rows={rows}
        style={textareaStyle}
        placeholder={placeholder}
        onFocus={(e) => {
          e.target.style.borderColor = "#13686a";
          e.target.style.background = "white";
          e.target.style.boxShadow = "0 0 0 3px rgba(19, 104, 106, 0.1)";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "#e1e5e9";
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

export default FormTextarea;
