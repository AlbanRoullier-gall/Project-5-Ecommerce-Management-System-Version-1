import React from "react";
import styles from "../../../styles/components/FilterSelect.module.css";

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
}) => {
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {icon && <i className={`${icon} ${styles.icon}`}></i>}
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={styles.select}
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
