import React from "react";
import { AlertCircle } from "lucide-react";

interface ConfirmModalProps {
  show: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

export default function ConfirmModal({
  show,
  onClose,
  onConfirm,
  title = "Confirmation",
  message,
  confirmText = "Confirmer",
  cancelText = "Annuler",
  isLoading = false,
}: ConfirmModalProps) {
  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">{title}</h2>
        <p className="modal-text">{message}</p>
        <div className="modal-buttons">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="modal-button modal-button-secondary"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="modal-button modal-button-error"
          >
            {isLoading ? "Traitement..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
