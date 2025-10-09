import React from "react";

/**
 * Props du composant FormSelect
 */
interface FormSelectProps {
  /** ID unique du select */
  id: string;
  /** Nom du select pour le formulaire */
  name: string;
  /** Valeur sélectionnée */
  value: string | number;
  /** Callback appelé lors du changement de sélection */
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  /** Label affiché au-dessus du select */
  label: string;
  /** Liste des options disponibles */
  options: Array<{ value: string | number; label: string }>;
  /** Message d'erreur à afficher */
  error?: string;
  /** Indique si le champ est requis */
  required?: boolean;
  /** Texte de l'option placeholder */
  placeholder?: string;
}

/**
 * Composant select de formulaire avec label, validation et gestion des erreurs
 * Supporte les états focus/blur avec animation
 *
 * @example
 * <FormSelect
 *   id="categoryId"
 *   name="categoryId"
 *   value={formData.categoryId}
 *   onChange={handleChange}
 *   label="Catégorie"
 *   options={categoryOptions}
 *   required
 * />
 */
const FormSelect: React.FC<FormSelectProps> = ({
  id,
  name,
  value,
  onChange,
  label,
  options,
  error,
  required = false,
  placeholder,
}) => {
  const selectStyle: React.CSSProperties = {
    width: "100%",
    padding: "1rem 1.25rem",
    border: "2px solid #e1e5e9",
    borderRadius: "10px",
    fontSize: "1rem",
    transition: "all 0.3s ease",
    background: "#f8f9fa",
    fontFamily: "inherit",
    boxSizing: "border-box",
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
      <select
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        style={selectStyle}
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
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
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

export default FormSelect;
