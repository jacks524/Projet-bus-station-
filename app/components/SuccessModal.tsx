import React from "react";

interface SuccessModalProps {
  show: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  buttonText?: string;
}

export default function SuccessModal({
  show,
  onClose,
  title = "Message envoyé !",
  message = "Nous vous répondrons dans les plus brefs délais.",
  buttonText = "OK",
}: SuccessModalProps) {
  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">{title}</h2>
        <p className="modal-text">{message}</p>
        <button onClick={onClose} className="modal-button modal-button-success">
          {buttonText}
        </button>
      </div>
    </div>
  );
}
