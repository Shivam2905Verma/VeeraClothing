import { useEffect, useState } from "react";
import style from "../style/toast.module.css";

const Toast = ({ message, type = "error", duration = 5000, onClose }) => {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (!message) {
      setVisible(false);
      setLeaving(false);
      return;
    }

    // Slide down from top
    setVisible(true);
    setLeaving(false);

    // Slide back up 450ms before duration expires
    const leaveTimer = setTimeout(
      () => {
        setLeaving(true);
      },
      Math.max(duration - 450, 0),
    );

    // Reset and trigger onClose after duration completes
    const closeTimer = setTimeout(() => {
      setVisible(false);
      if (onClose) onClose();
    }, duration);

    return () => {
      clearTimeout(leaveTimer);
      clearTimeout(closeTimer);
    };
  }, [message, duration, onClose]);

  if (!message) return null;

  const handleManualClose = () => {
    setLeaving(true);
    setTimeout(() => {
      setVisible(false);
      if (onClose) onClose();
    }, 350);
  };

  const isSuccess = type === "success";

  return (
    <div
      className={`${style.toastContainer} ${
        isSuccess ? style.toastSuccess : style.toastError
      } ${visible && !leaving ? style.visible : ""} ${
        leaving ? style.leaving : ""
      }`}
      role="alert"
    >
      <div className={style.toastContent}>
        <div
          className={`${style.icon} ${
            isSuccess ? style.iconSuccess : style.iconError
          }`}
        >
          {isSuccess ? (
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
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
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          )}
        </div>
        <span>{message}</span>
      </div>
      <button
        type="button"
        className={style.closeBtn}
        onClick={handleManualClose}
        aria-label="Close notification"
      >
        <svg
          width="16"
          height="16"
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
    </div>
  );
};

export default Toast;

