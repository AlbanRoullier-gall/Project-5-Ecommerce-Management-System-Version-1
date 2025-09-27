"use client";

import React from "react";
import { Modal, Button } from "./common";

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
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="modal-body">
        <p className="text-gray-700 mb-6">{message}</p>
        <div className="modal-actions">
          <Button variant="primary" onClick={onClose} fullWidth>
            OK
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default InfoModal;
