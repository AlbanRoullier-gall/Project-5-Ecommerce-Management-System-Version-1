import React from "react";

/**
 * Option pour le select
 */
export interface FormSelectOption {
  value: string;
  label: string;
}

/**
 * Props du composant FormSelect
 */
interface FormSelectProps {
  /** ID et nom du champ */
  id?: string;
  name: string;
  /** Valeur sélectionnée */
  value: string;
  /** Callback appelé lors du changement */
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  /** Label du champ */
  label?: string;
  /** Options du select */
  options: FormSelectOption[];
  /** Placeholder (option vide) */
  placeholder?: string;
  /** Indique si le champ est requis */
  required?: boolean;
  /** Message d'erreur */
  error?: string;
  /** Largeur de la colonne dans la grille */
  gridColumn?: string;
}

/**
 * Composant de select de formulaire réutilisable
 *
 * @example
 * <FormSelect
 *   name="country"
 *   label="Pays"
 *   value={formData.country}
 *   onChange={handleChange}
 *   options={countryOptions}
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
  placeholder,
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

  const selectStyle: React.CSSProperties = {
    width: "100%",
    padding: "1.2rem",
    fontSize: "1.3rem",
    border: error ? "2px solid #c33" : "2px solid #ddd",
    borderRadius: "8px",
    transition: "border-color 0.3s ease",
    backgroundColor: "white",
    cursor: "pointer",
  };

  const handleFocus = (e: React.FocusEvent<HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = "#13686a";
  };

  const handleBlur = (e: React.FocusEvent<HTMLSelectElement>) => {
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
      <select
        id={id || name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        style={selectStyle}
        onFocus={handleFocus}
        onBlur={handleBlur}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
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

export default FormSelect;
