import React from "react";

/**
 * Props du composant FormContainer
 */
interface FormContainerProps {
  /** Enfants (contenu du formulaire) */
  children: React.ReactNode;
  /** Classe CSS personnalisée */
  className?: string;
}

/**
 * Composant conteneur pour les formulaires
 * Style uniforme pour tous les formulaires du frontend
 *
 * @example
 * <FormContainer>
 *   <form>
 *     <FormInput ... />
 *   </form>
 * </FormContainer>
 */
const FormContainer: React.FC<FormContainerProps> = ({
  children,
  className = "checkout-form-container",
}) => {
  return (
    <div
      className={className}
      style={{
        background: "white",
        borderRadius: "16px",
        padding: "3rem",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      }}
    >
      {children}
    </div>
  );
};

export default FormContainer;

