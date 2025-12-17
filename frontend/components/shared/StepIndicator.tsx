import React from "react";
import styles from "../../styles/components/StepIndicator.module.css";

export interface Step {
  number: number;
  label: string;
  icon: string;
  path?: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({
  steps,
  currentStep,
}) => {
  return (
    <div className={styles.container}>
      {steps.map((step, index) => {
        const isCompleted = currentStep > step.number;
        const isCurrent = currentStep === step.number;
        const isActive = currentStep >= step.number;

        return (
          <div key={step.number} className={styles.step}>
            {index < steps.length - 1 && (
              <div
                className={`${styles.connector} ${
                  isCompleted ? styles.connectorActive : ""
                }`}
              />
            )}

            <div
              className={`${styles.iconWrapper} ${
                isActive ? styles.iconActive : ""
              }`}
            >
              {isCompleted ? (
                <i className="fas fa-check"></i>
              ) : (
                <i className={`fas ${step.icon}`}></i>
              )}
            </div>

            <div
              className={`${styles.label} ${
                isActive ? styles.labelActive : ""
              }`}
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
