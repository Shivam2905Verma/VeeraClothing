import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createMeasurement } from "../../service/measurement.service";
import Toast from "../../../common/Toast";
import style from "../../style/page/addProduct.module.css";

const AddMeasurement = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    unit: "inch",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "error" });
  const showToast = (message, type = "error") => setToast({ message, type });

  const commonUnits = ["inch", "cm", "mm", "m", "custom"];
  const [selectedUnitType, setSelectedUnitType] = useState("inch");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUnitSelect = (unit) => {
    setSelectedUnitType(unit);
    if (unit !== "custom") {
      setFormData((prev) => ({ ...prev, unit }));
    } else {
      setFormData((prev) => ({ ...prev, unit: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      showToast("Please enter a measurement type name.", "error");
      return;
    }

    if (!formData.unit.trim()) {
      showToast("Please specify a standard unit (e.g. inch, cm).", "error");
      return;
    }

    try {
      setIsSubmitting(true);
      await createMeasurement({
        name: formData.name.trim(),
        unit: formData.unit.trim(),
      });

      showToast("Measurement type created successfully!", "success");

      setTimeout(() => {
        navigate("/dashboard/measurements");
      }, 800);
    } catch (error) {
      console.error("Failed to create measurement:", error);
      const msg =
        error.response?.data?.message ||
        error.response?.data?.errors?.[0]?.message ||
        "Failed to create measurement type. Please verify inputs.";
      showToast(msg, "error");
      setIsSubmitting(false);
    }
  };

  return (
    <div className={style.pageContainer}>
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "error" })}
        duration={5000}
      />

      {/* Top Header Bar */}
      <div className={style.headerBar}>
        <div className={style.headerLeft}>
          <Link
            to="/dashboard/measurements"
            className={style.backLink}
            title="Back to Measurements"
          >
            <i className="ri-arrow-left-line" style={{ fontSize: "1.25rem" }} />
          </Link>
          <div>
            <h1 className={style.headerTitle}>Add New Measurement</h1>
            <p className={style.headerSubtitle}>
              Define custom measurement specifications and tailoring parameters.
            </p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit}>
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          {/* Measurement Name */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label
              htmlFor="measurement-name"
              style={{
                fontSize: "0.825rem",
                fontWeight: 600,
                color: "#374151",
              }}
            >
              Measurement Name <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              id="measurement-name"
              name="name"
              type="text"
              placeholder="e.g. Chest, Waist, Inseam, Shoulder, Sleeve Length"
              value={formData.name}
              onChange={handleInputChange}
              required
              style={{
                height: "40px",
                padding: "0 12px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "0.875rem",
                color: "#111827",
                outline: "none",
                background: "#ffffff",
              }}
            />
            <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>
              The label that customers and tailors will see during measurement
              configuration.
            </span>
          </div>

          {/* Unit Selection */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label
              style={{
                fontSize: "0.825rem",
                fontWeight: 600,
                color: "#374151",
              }}
            >
              Standard Unit <span style={{ color: "#ef4444" }}>*</span>
            </label>

            {/* Quick Unit Chips */}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {commonUnits.map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => handleUnitSelect(u)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "20px",
                    border:
                      selectedUnitType === u
                        ? "1px solid #111827"
                        : "1px solid #e5e7eb",
                    background: selectedUnitType === u ? "#111827" : "#f9fafb",
                    color: selectedUnitType === u ? "#ffffff" : "#4b5563",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    textTransform: u === "custom" ? "capitalize" : "uppercase",
                    transition: "all 0.15s ease",
                  }}
                >
                  {u}
                </button>
              ))}
            </div>

            {/* Custom Unit Input */}
            <div style={{ marginTop: "4px" }}>
              <input
                id="measurement-unit"
                name="unit"
                type="text"
                placeholder="Unit (e.g. inch, cm)"
                value={formData.unit}
                onChange={handleInputChange}
                required
                style={{
                  height: "40px",
                  padding: "0 12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  fontSize: "0.875rem",
                  color: "#111827",
                  outline: "none",
                  background: "#ffffff",
                  maxWidth: "240px",
                }}
              />
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className={style.bottomActions}>
          <Link to="/dashboard/measurements" className={style.cancelBtn}>
            Cancel
          </Link>
          <button
            type="submit"
            className={style.submitBtn}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating Measurement..." : "Save Measurement"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddMeasurement;
