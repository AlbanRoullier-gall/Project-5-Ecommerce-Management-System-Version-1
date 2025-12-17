import React from "react";
import styles from "../../../styles/components/FormControls.module.css";

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
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <textarea
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        rows={rows}
        className={`${styles.textarea} ${error ? styles.textareaError : ""}`}
        placeholder={placeholder}
      />
      {error && <p className={styles.errorText}>⚠️ {error}</p>}
    </div>
  );
};

export default FormTextarea;
