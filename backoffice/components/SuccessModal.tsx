"use client";

import React, { useEffect } from "react";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  autoCloseDelay?: number; // Délai en millisecondes pour fermer automatiquement
}

const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  autoCloseDelay = 4000, // 4 secondes par défaut
}) => {
  useEffect(() => {
    if (isOpen && autoCloseDelay > 0) {
      console.log("SuccessModal: Démarré le timer de fermeture automatique");
      const timer = setTimeout(() => {
        console.log("SuccessModal: Fermeture automatique");
        onClose();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [isOpen, autoCloseDelay, onClose]);

  if (!isOpen) return null;

  console.log("SuccessModal: Rendu de la modal", { isOpen, title, message });

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="modal-overlay success-modal-overlay"
      onClick={handleOverlayClick}
    >
      <div className="modal-content success-modal">
        <div className="success-icon">✅</div>
        <div className="success-content">
          <h3 className="success-title">{title}</h3>
          <p className="success-message">{message}</p>
        </div>
        <button className="btn btn-primary success-close-btn" onClick={onClose}>
          Compris
        </button>
      </div>
    </div>
  );
};

export default SuccessModal;
