import React from "react";

/**
 * Props du composant FormCheckbox
 */
interface FormCheckboxProps {
  /** ID unique de la checkbox */
  id: string;
  /** Nom de la checkbox pour le formulaire */
  name: string;
  /** État coché/non coché */
  checked: boolean;
  /** Callback appelé lors du changement d'état */
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** Label affiché à côté de la checkbox */
  label: string;
}

/**
 * Composant checkbox de formulaire avec label
 * Affiche une case à cocher avec un fond coloré
 *
 * @example
 * <FormCheckbox
 *   id="isActive"
 *   name="isActive"
 *   checked={formData.isActive}
 *   onChange={handleChange}
 *   label="✅ Produit actif"
 * />
 */
const FormCheckbox: React.FC<FormCheckboxProps> = ({
  id,
  name,
  checked,
  onChange,
  label,
}) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        background: "#f8f9fa",
        padding: "1.5rem",
        borderRadius: "10px",
        border: "2px solid #e1e5e9",
      }}
    >
      <input
        type="checkbox"
        id={id}
        name={name}
        checked={checked}
        onChange={onChange}
        style={{
          width: "1.25rem",
          height: "1.25rem",
          marginRight: "1rem",
          cursor: "pointer",
        }}
      />
      <label
        htmlFor={id}
        style={{
          fontSize: "1rem",
          color: "#111827",
          cursor: "pointer",
          fontWeight: "500",
        }}
      >
        {label}
      </label>
    </div>
  );
};

export default FormCheckbox;
