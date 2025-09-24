"use client";

import React from "react";

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
}

const InfoModal: React.FC<InfoModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
}) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content info-modal">
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="info-icon">ℹ️</div>
          <div className="info-message">
            {message.split("\n").map((line, index) => (
              <p
                key={index}
                style={{ margin: line.trim() ? "0.5rem 0" : "0.25rem 0" }}
              >
                {line}
              </p>
            ))}
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn btn-primary" onClick={onClose}>
            Compris
          </button>
        </div>
      </div>
    </div>
  );
};

export default InfoModal;
