import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login as apiLogin } from "../../service/auth.service";
import { useDashboard } from "../../context/DashboardContext";
import Toast from "../../../common/Toast.jsx";
import style from "../../style/page/login.module.css";

const DashboardLogin = () => {
  const navigate = useNavigate();
  const { adminData, loading: authChecking, fetchAdmin } = useDashboard();
  const [formData, setFormData] = useState({
    userId: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!authChecking && adminData) {
      navigate("/dashboard", { replace: true });
    }
  }, [adminData, authChecking, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMsg) setErrorMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.userId.trim() || !formData.password) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }

    if (formData.userId.trim().length < 3) {
      setErrorMsg("Admin ID must be at least 3 characters long.");
      return;
    }

    if (formData.password.length < 8) {
      setErrorMsg("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      await apiLogin({
        userId: formData.userId.trim(),
        password: formData.password,
      });

      await fetchAdmin();
      navigate("/dashboard");
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.errors?.[0]?.message ||
        "Failed to sign in. Please verify your admin credentials.";
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={style.authPage}>
      <Link to="/" className={style.homeNavBtn}>
        <span>Home</span>
        <i className="ri-arrow-right-line" />
      </Link>

      <Toast
        message={errorMsg}
        type="error"
        duration={5000}
        onClose={() => setErrorMsg("")}
      />

      <div className={style.authCard}>
        <div className={style.authHeader}>
          <div className={style.subheading}>Veera • Admin Portal</div>
          <h1 className={style.title}>Sign In</h1>
          <p className={style.authSubtitle}>
            Enter your admin credentials to access the store management portal.
          </p>
        </div>

        <form className={style.form} onSubmit={handleSubmit}>
          <div className={style.inputGroup}>
            <label htmlFor="admin-userId" className={style.label}>
              Admin User ID
            </label>
            <div className={style.inputWrapper}>
              <input
                id="admin-userId"
                type="text"
                name="userId"
                value={formData.userId}
                onChange={handleChange}
                placeholder="admin"
                required
                className={style.input}
                autoComplete="username"
                disabled={loading}
              />
            </div>
          </div>

          <div className={style.inputGroup}>
            <label htmlFor="admin-password" className={style.label}>
              Password
            </label>
            <div className={style.inputWrapper}>
              <input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className={style.input}
                autoComplete="current-password"
                disabled={loading}
              />
              <button
                type="button"
                className={style.passwordToggle}
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <i
                  className={showPassword ? "ri-eye-off-line" : "ri-eye-line"}
                />
              </button>
            </div>
          </div>

          <button type="submit" className={style.submitBtn} disabled={loading}>
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className={style.divider}>
          <span>Store Management</span>
        </div>

        <p className={style.switchPrompt}>
          Looking for customer store?
          <Link to="/" className={style.switchLink}>
            Return to shop
          </Link>
        </p>

        <div className={style.benefitsList}>
          <div className={style.benefitItem}>
            <i className="ri-shield-keyhole-line" />
            <span>Secure Admin</span>
          </div>
          <div className={style.benefitItem}>
            <i className="ri-dashboard-line" />
            <span>Management</span>
          </div>
          <div className={style.benefitItem}>
            <i className="ri-line-chart-line" />
            <span>Analytics</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLogin;
