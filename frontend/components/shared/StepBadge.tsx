import React from "react";

/**
 * Props du composant StepBadge
 */
interface StepBadgeProps {
  /** Numéro de l'étape */
  number: number | string;
  /** Taille du badge */
  size?: "small" | "medium" | "large";
}

/**
 * Composant de badge d'étape réutilisable
 * Badge circulaire avec numéro d'étape pour les formulaires
 *
 * @example
 * <StepBadge number={1} />
 * <StepBadge number={2} size="large" />
 */
const StepBadge: React.FC<StepBadgeProps> = ({ number, size = "medium" }) => {
  const sizeMap = {
    small: {
      width: "40px",
      height: "40px",
      fontSize: "1.4rem",
    },
    medium: {
      width: "50px",
      height: "50px",
      fontSize: "1.8rem",
    },
    large: {
      width: "60px",
      height: "60px",
      fontSize: "2.2rem",
    },
  };

  const dimensions = sizeMap[size];

  return (
    <div
      style={{
        width: dimensions.width,
        height: dimensions.height,
        borderRadius: "50%",
        background: "linear-gradient(135deg, #13686a 0%, #0dd3d1 100%)",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: dimensions.fontSize,
        fontWeight: "700",
      }}
    >
      {number}
    </div>
  );
};

export default StepBadge;
