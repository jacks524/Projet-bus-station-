import React from "react";

interface ErrorModalProps {
  show: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  buttonText?: string;
}

export default function ErrorModal({
  show,
  onClose,
  title = "Oups !",
  message,
  buttonText = "Réessayer",
}: ErrorModalProps) {
  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">{title}</h2>
        <p className="modal-text">{message}</p>
        <button onClick={onClose} className="modal-button modal-button-error">
          {buttonText}
        </button>
      </div>
    </div>
  );
}
