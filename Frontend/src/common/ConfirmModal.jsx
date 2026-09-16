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
          <i className="ri-close-line" style={{ fontSize: "1.2rem" }} />
        </button>

        {/* Header Icon */}
        <div
          className={`${style.iconWrapper} ${
            isDestructive ? style.destructive : ""
          }`}
        >
          {isDestructive ? (
            <i className="ri-delete-bin-line" style={{ fontSize: "1.4rem" }} />
          ) : (
            <i
              className="ri-error-warning-line"
              style={{ fontSize: "1.4rem" }}
            />
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
