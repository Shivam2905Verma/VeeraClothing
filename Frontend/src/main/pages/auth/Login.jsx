import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import style from "../../style/pages/auth.module.css";
import { loginUser } from "../../services/auth.service";
import Toast from "../../../common/Toast.jsx";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await loginUser({
        email: formData.email,
        password: formData.password,
      });

      if (res?.success) {
        navigate("/");
        window.location.reload(); // Reload to refresh user state & cart if needed
      }
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Failed to sign in. Please verify your credentials.";
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
          <div className={style.subheading}>Veera</div>
          <h1 className={style.title}>Sign In</h1>
        </div>

        <form className={style.form} onSubmit={handleSubmit}>
          <div className={style.inputGroup}>
            <label htmlFor="login-email" className={style.label}>
              Email Address
            </label>
            <div className={style.inputWrapper}>
              <input
                id="login-email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                required
                className={style.input}
                autoComplete="email"
              />
            </div>
          </div>

          <div className={style.inputGroup}>
            <label htmlFor="login-password" className={style.label}>
              Password
            </label>
            <div className={style.inputWrapper}>
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className={style.input}
                autoComplete="current-password"
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

          <div className={style.extraRow}>
            <Link to="/forgot-password" className={style.forgotLink}>
              Forgot password?
            </Link>
          </div>

          <button type="submit" className={style.submitBtn} disabled={loading}>
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className={style.divider}>
          <span>New to Veera?</span>
        </div>

        <p className={style.switchPrompt}>
          Don't have an account?
          <Link to="/register" className={style.switchLink}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
