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
            <i className="ri-checkbox-circle-fill" style={{ fontSize: "1.2rem" }} />
          ) : (
            <i className="ri-error-warning-fill" style={{ fontSize: "1.2rem" }} />
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
        <i className="ri-close-line" style={{ fontSize: "1.1rem" }} />
      </button>
    </div>
  );
};

export default Toast;

