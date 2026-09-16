import { useEffect, useState } from "react";
import style from "../style/confirmModal.module.css";

const ConfirmModal = ({
  isOpen,
  title = "Confirm Action",
  message = "Are you sure you want to proceed with this action?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  isDestructive = true,
  isLoading = false,
}) => {
  const [rendered, setRendered] = useState(false);
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setRendered(true);
      setLeaving(false);
      // Small timeout to allow DOM node to mount before triggering CSS transition
      const timer = setTimeout(() => {
        setVisible(true);
      }, 20);
      return () => clearTimeout(timer);
    } else if (rendered) {
      setLeaving(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setLeaving(false);
        setRendered(false);
      }, 250); // Matches transition duration
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape" && onCancel && !isLoading) {
        onCancel();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    // Lock body scrolling when modal is active
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onCancel, isLoading]);

  if (!rendered) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && onCancel && !isLoading) {
      onCancel();
    }
  };

  return (
    <div
      className={`${style.overlay} ${
        visible && !leaving ? style.visible : ""
      } ${leaving ? style.leaving : ""}`}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      <div className={style.modal}>
        {/* Close Button */}
        <button
          type="button"
          className={style.closeBtn}
          onClick={onCancel}
          disabled={isLoading}
          aria-label="Close modal"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Header Icon */}
        <div
          className={`${style.iconWrapper} ${
            isDestructive ? style.destructive : ""
          }`}
        >
          {isDestructive ? (
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 6h18" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
          ) : (
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          )}
        </div>

        {/* Title & Message */}
        <h3 id="confirm-modal-title" className={style.title}>
          {title}
        </h3>
        <p className={style.message}>{message}</p>

        {/* Action Buttons */}
        <div className={style.actionGroup}>
          <button
            type="button"
            className={style.cancelBtn}
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={`${style.confirmBtn} ${
              isDestructive ? style.destructive : ""
            }`}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
