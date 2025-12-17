import React from "react";
import styles from "../../../styles/components/FormControls.module.css";

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
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label} {required && <span className={styles.required}>*</span>}
      </label>
      <select
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        className={`${styles.select} ${error ? styles.selectError : ""}`}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className={styles.errorText}>⚠️ {error}</p>}
    </div>
  );
};

export default FormSelect;
