import React from "react";
import StepBadge from "./StepBadge";

/**
 * Props du composant FormHeader
 */
interface FormHeaderProps {
  /** Numéro de l'étape */
  stepNumber: number | string;
  /** Titre du formulaire */
  title: string;
  /** Taille du badge (optionnelle) */
  badgeSize?: "small" | "medium" | "large";
}

/**
 * Composant d'en-tête de formulaire réutilisable
 * Affiche un badge d'étape et un titre
 *
 * @example
 * <FormHeader stepNumber={1} title="Vos informations personnelles" />
 */
const FormHeader: React.FC<FormHeaderProps> = ({
  stepNumber,
  title,
  badgeSize = "medium",
}) => {
  return (
    <div
      className="checkout-form-header"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        marginBottom: "2.5rem",
      }}
    >
      <StepBadge number={stepNumber} size={badgeSize} />
      <h2
        className="checkout-form-title"
        style={{
          fontSize: "2.2rem",
          fontWeight: "700",
          color: "#333",
        }}
      >
        {title}
      </h2>
    </div>
  );
};

export default FormHeader;
