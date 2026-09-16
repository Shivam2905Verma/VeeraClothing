import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import style from "../../style/pages/auth.module.css";
import { registerUser } from "../../services/auth.service";
import Toast from "../../components/common/Toast";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile_no: "",
    password: "",
    confirmPassword: "",
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

    if (!formData.name || !formData.email || !formData.password) {
      setErrorMsg("Please fill in all mandatory fields.");
      return;
    }

    if (formData.password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg("Passwords do not match. Please check again.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      if (res?.success) {
        // Redirect to login page after successful registration
        navigate("/login");
      }
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Registration failed. Please try again or use another email.";
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
          <h1 className={style.title}>Create Account</h1>
        </div>

        <form className={style.form} onSubmit={handleSubmit}>
          <div className={style.inputGroup}>
            <label htmlFor="register-name" className={style.label}>
              Full Name *
            </label>
            <div className={style.inputWrapper}>
              <input
                id="register-name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Eleanor Vance"
                required
                className={style.input}
                autoComplete="name"
              />
            </div>
          </div>

          <div className={style.inputGroup}>
            <label htmlFor="register-email" className={style.label}>
              Email Address *
            </label>
            <div className={style.inputWrapper}>
              <input
                id="register-email"
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
            <label htmlFor="register-password" className={style.label}>
              Password *
            </label>
            <div className={style.inputWrapper}>
              <input
                id="register-password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 6 characters"
                required
                className={style.input}
                autoComplete="new-password"
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

          <div className={style.inputGroup}>
            <label htmlFor="register-confirm-password" className={style.label}>
              Confirm Password *
            </label>
            <div className={style.inputWrapper}>
              <input
                id="register-confirm-password"
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Repeat your password"
                required
                className={style.input}
                autoComplete="new-password"
              />
            </div>
          </div>

          <button type="submit" className={style.submitBtn} disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className={style.divider}>
          <span>Member Services</span>
        </div>

        <p className={style.switchPrompt}>
          Already have an account?
          <Link to="/login" className={style.switchLink}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
