import React from "react";
import styles from "../../../styles/components/FormControls.module.css";

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
  /** Occupe toute la largeur disponible */
  fullWidth?: boolean;
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
  fullWidth = false,
}) => {
  return (
    <div className={styles.field}>
      {label && (
        <label htmlFor={id || name} className={styles.label}>
          {label} {required && <span className={styles.required}>*</span>}
        </label>
      )}
      <input
        type={type}
        id={id || name}
        name={name}
        value={value}
        onChange={onChange}
        className={`${styles.input} ${error ? styles.inputError : ""} ${
          readOnly ? styles.readOnly : ""
        }`}
        placeholder={placeholder}
        required={required}
        readOnly={readOnly}
        step={step}
        min={min}
        max={max}
      />
      {error && <p className={styles.errorText}>⚠️ {error}</p>}
    </div>
  );
};

export default FormInput;
