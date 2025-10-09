"use client";

import React from "react";

/**
 * Props du composant GlobalMessage
 */
interface GlobalMessageProps {
  /** Message à afficher */
  message: string;
  /** Type de message (error ou success) */
  type: "error" | "success";
}

/**
 * Composant GlobalMessage
 *
 * Affiche un message global d'erreur ou de succès
 *
 * @example
 * <GlobalMessage message="Email invalide" type="error" />
 * <GlobalMessage message="Connexion réussie" type="success" />
 */
const GlobalMessage: React.FC<GlobalMessageProps> = ({ message, type }) => {
  // Fonction pour formater les messages d'erreur longs
  const formatErrorMessage = (msg: string) => {
    if (!msg) return msg;

    // Diviser le message en phrases et les formater
    const sentences = msg.split(/[.!?]+/).filter((s) => s.trim());
    return sentences.map((sentence) => sentence.trim()).join("\n");
  };

  const className =
    type === "error" ? "auth-error-global" : "auth-success-global";
  const icon = type === "error" ? "fa-exclamation-triangle" : "fa-check-circle";
  const label = type === "error" ? "Erreur" : "Succès";

  return (
    <div className={className}>
      <i className={`fas ${icon}`}></i>
      <div className={`${type}-content`}>
        <strong>{label} :</strong>
        <div className={`${type}-message-text`}>
          {formatErrorMessage(message)}
        </div>
      </div>
    </div>
  );
};

export default GlobalMessage;
