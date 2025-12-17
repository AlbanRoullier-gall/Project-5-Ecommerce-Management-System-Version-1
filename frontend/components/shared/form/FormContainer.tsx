import React from "react";
import styles from "../../../styles/components/FormContainer.module.css";

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
    <div className={`${styles.container} ${className || ""}`}>{children}</div>
  );
};

export default FormContainer;
