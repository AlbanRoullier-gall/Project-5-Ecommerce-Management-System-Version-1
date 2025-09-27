"use client";

import React from "react";
import { Modal, Button } from "./common";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  itemName: string;
  isLoading?: boolean;
  warningMessage?: string;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemName,
  isLoading = false,
  warningMessage,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      closeOnOverlayClick={!isLoading}
    >
      <div className="modal-body text-center">
        <div className="text-6xl mb-4">🗑️</div>
        <p className="text-gray-700 mb-4">{message}</p>
        <p className="font-semibold text-gray-900 mb-4">"{itemName}"</p>

        {warningMessage && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-6">
            <p className="text-yellow-800 text-sm">{warningMessage}</p>
          </div>
        )}

        <div className="modal-actions flex gap-3">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1"
          >
            Annuler
          </Button>
          <Button
            variant="danger"
            onClick={onConfirm}
            loading={isLoading}
            className="flex-1"
          >
            {isLoading ? "Suppression..." : "Supprimer"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteConfirmModal;
