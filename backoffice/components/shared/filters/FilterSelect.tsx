import React from "react";

/**
 * Option pour le select
 */
export interface FilterSelectOption {
  value: string;
  label: string;
}

/**
 * Props du composant FilterSelect
 */
interface FilterSelectProps {
  /** ID du select */
  id: string;
  /** Label du select */
  label: string;
  /** Icône FontAwesome (optionnelle) */
  icon?: string;
  /** Valeur sélectionnée */
  value: string;
  /** Callback appelé lors du changement */
  onChange: (value: string) => void;
  /** Options du select */
  options: FilterSelectOption[];
  /** Placeholder pour l'option par défaut (optionnelle) */
  placeholder?: string;
  /** Largeur minimale (optionnelle) */
  minWidth?: string;
}

/**
 * Composant de select de filtre réutilisable
 * Style uniforme pour tous les filtres de type select
 *
 * @example
 * <FilterSelect
 *   id="status"
 *   label="Statut"
 *   icon="fas fa-toggle-on"
 *   value={statusFilter}
 *   onChange={setStatusFilter}
 *   options={[
 *     { value: "", label: "Tous les statuts" },
 *     { value: "active", label: "Actif" },
 *     { value: "inactive", label: "Inactif" }
 *   ]}
 * />
 */
const FilterSelect: React.FC<FilterSelectProps> = ({
  id,
  label,
  icon,
  value,
  onChange,
  options,
  placeholder,
  minWidth = "300px",
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
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "1.1rem",
    fontWeight: "600",
    color: "#13686a",
    marginBottom: "0.75rem",
  };

  return (
    <div style={{ minWidth, maxWidth: "100%" }}>
      <label htmlFor={id} style={labelStyle}>
        {icon && <i className={icon} style={{ marginRight: "0.5rem" }}></i>}
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={selectStyle}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "#13686a";
          e.currentTarget.style.background = "white";
          e.currentTarget.style.boxShadow = "0 0 0 3px rgba(19, 104, 106, 0.1)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "#e1e5e9";
          e.currentTarget.style.background = "#f8f9fa";
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default FilterSelect;
