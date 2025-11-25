import React from "react";

/**
 * Étape du processus
 */
export interface Step {
  number: number;
  label: string;
  icon: string;
  path?: string;
}

/**
 * Props du composant StepIndicator
 */
interface StepIndicatorProps {
  /** Étapes du processus */
  steps: Step[];
  /** Numéro de l'étape courante */
  currentStep: number;
  /** Couleur du gradient (optionnelle) */
  gradientColor?: string;
}

/**
 * Composant d'indicateur de progression multi-étapes
 * Affiche les étapes d'un processus avec indicateur visuel de progression
 *
 * @example
 * <StepIndicator
 *   steps={[
 *     { number: 1, label: "Informations", icon: "fa-user" },
 *     { number: 2, label: "Adresses", icon: "fa-map-marker-alt" },
 *     { number: 3, label: "Paiement", icon: "fa-credit-card" }
 *   ]}
 *   currentStep={2}
 * />
 */
const StepIndicator: React.FC<StepIndicatorProps> = ({
  steps,
  currentStep,
  gradientColor = "linear-gradient(135deg, #13686a 0%, #0dd3d1 100%)",
}) => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: "4rem",
        padding: "0 2rem",
      }}
    >
      {steps.map((step, index) => {
        const isCompleted = currentStep > step.number;
        const isCurrent = currentStep === step.number;
        const isActive = currentStep >= step.number;

        return (
          <div
            key={step.number}
            style={{
              flex: 1,
              position: "relative",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            {/* Ligne de connexion */}
            {index < steps.length - 1 && (
              <div
                style={{
                  position: "absolute",
                  top: "25px",
                  left: "50%",
                  right: "-50%",
                  height: "4px",
                  background: isCompleted ? gradientColor : "#e0e0e0",
                  zIndex: 0,
                }}
              />
            )}

            {/* Icône étape */}
            <div
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                background: isActive ? gradientColor : "#e0e0e0",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.8rem",
                fontWeight: "700",
                position: "relative",
                zIndex: 1,
                marginBottom: "1rem",
                boxShadow: isActive
                  ? "0 4px 12px rgba(19, 104, 106, 0.3)"
                  : "none",
                transition: "all 0.3s ease",
              }}
            >
              {isCompleted ? (
                <i className="fas fa-check"></i>
              ) : (
                <i className={`fas ${step.icon}`}></i>
              )}
            </div>

            {/* Label étape */}
            <div
              style={{
                fontSize: "1.3rem",
                fontWeight: isCurrent ? "700" : "500",
                color: isActive ? "#13686a" : "#999",
                textAlign: "center",
              }}
            >
              {step.label}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StepIndicator;
