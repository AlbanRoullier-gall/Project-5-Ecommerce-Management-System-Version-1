"use client";

import React from "react";

/**
 * Props du composant FormButton
 */
interface FormButtonProps {
  /** Texte du bouton */
  text: string;
  /** État de chargement */
  isLoading?: boolean;
  /** Type du bouton */
  type?: "button" | "submit" | "reset";
  /** Bouton désactivé ou non */
  disabled?: boolean;
  /** Callback au clic (optionnel si type="submit") */
  onClick?: () => void;
}

/**
 * Composant FormButton
 *
 * Affiche un bouton de formulaire avec état de chargement
 *
 * @example
 * <FormButton
 *   text="Se connecter"
 *   type="submit"
 *   isLoading={isLoading}
 * />
 */
const FormButton: React.FC<FormButtonProps> = ({
  text,
  isLoading = false,
  type = "submit",
  disabled = false,
  onClick,
}) => {
  return (
    <button
      type={type}
      className="auth-submit-btn"
      disabled={isLoading || disabled}
      onClick={onClick}
    >
      {isLoading ? (
        <>
          <i className="fas fa-spinner fa-spin"></i>
          Chargement...
        </>
      ) : (
        text
      )}
    </button>
  );
};

export default FormButton;
