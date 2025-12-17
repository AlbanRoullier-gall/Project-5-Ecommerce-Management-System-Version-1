"use client";

import React from "react";
import styles from "../../styles/components/LoadingSpinner.module.css";

interface LoadingSpinnerProps {
  message?: string;
  size?: "small" | "medium" | "large";
  fullscreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = "Chargement...",
  size = "medium",
  fullscreen = false,
}) => {
  const sizeClass =
    size === "small"
      ? styles.spinnerSmall
      : size === "large"
      ? styles.spinnerLarge
      : styles.spinnerMedium;

  return (
    <div
      className={`${styles.container} ${fullscreen ? styles.fullscreen : ""}`}
    >
      <i
        className={`fas fa-spinner fa-spin ${
          fullscreen ? styles.spinnerFullscreen : styles.spinner
        } ${sizeClass}`}
      ></i>
      {message && (
        <p
          className={`${styles.message} ${
            fullscreen ? styles.messageFullscreen : ""
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;
