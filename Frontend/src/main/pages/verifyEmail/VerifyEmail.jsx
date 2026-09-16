import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import style from "../../style/pages/verifyemail.module.css";
import { verifyEmail } from "../../services/auth.service";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState("loading"); // "loading" | "success" | "error"
  const [message, setMessage] = useState("Verifying your email address...");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage(
        "No verification token provided. Please click the link sent to your email address.",
      );
      return;
    }

    let isMounted = true;

    const performVerification = async () => {
      try {
        const res = await verifyEmail(token);
        if (isMounted) {
          if (res?.success) {
            setStatus("success");
            setMessage(
              "Your email has been successfully verified! Your account is now active and ready for shopping.",
            );
          } else {
            setStatus("error");
            setMessage(
              res?.message || "Failed to verify email. Please try again.",
            );
          }
        }
      } catch (error) {
        if (isMounted) {
          const errorMessage =
            error.response?.data?.message ||
            "Verification link has expired or is invalid. Please request a new verification link.";
          setStatus("error");
          setMessage(errorMessage);
        }
      }
    };

    performVerification();

    return () => {
      isMounted = false;
    };
  }, [token]);

  return (
    <div className={style.verifyPage}>
      {/* Top Right Home Button */}
      <Link to="/" className={style.homeNavBtn}>
        <span>Home</span>
        <i className="ri-arrow-right-line" />
      </Link>

      <div className={style.verifyCard}>
        <div className={style.brandLabel}>Veera Clothing</div>

        {/* Status Graphic */}
        {status === "loading" && (
          <div className={`${style.statusIcon} ${style.loading}`}>
            <div className={style.spinner} />
          </div>
        )}

        {status === "success" && (
          <div className={`${style.statusIcon} ${style.success}`}>
            <i className="ri-checkbox-circle-fill" />
          </div>
        )}

        {status === "error" && (
          <div className={`${style.statusIcon} ${style.error}`}>
            <i className="ri-error-warning-fill" />
          </div>
        )}

        {/* Title */}
        <h1 className={style.title}>
          {status === "loading" && "Verifying Email"}
          {status === "success" && "Email Verified"}
          {status === "error" && "Verification Issue"}
        </h1>

        {/* Message */}
        <p className={style.message}>{message}</p>

        {/* Actions */}
        <div className={style.actionGroup}>
          {status === "success" && (
            <>
              <Link to="/shopall" className={style.primaryBtn}>
                Explore Collection
                <i className="ri-arrow-right-line" />
              </Link>
              <Link to="/cart" className={style.secondaryBtn}>
                View Shopping Bag
              </Link>
            </>
          )}

          {status === "error" && (
            <>
              <Link to="/login" className={style.primaryBtn}>
                Go to Sign In
              </Link>
              <Link to="/" className={style.secondaryBtn}>
                Back to Home
              </Link>
            </>
          )}

          {status === "loading" && (
            <p style={{ fontSize: "0.85rem", color: "#888", margin: 0 }}>
              Please wait a moment while we activate your account...
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
