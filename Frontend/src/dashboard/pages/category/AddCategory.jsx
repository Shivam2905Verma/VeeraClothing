import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createCategory } from "../../service/category.service";
import { getMeasurements } from "../../service/measurement.service";
import Toast from "../../../common/Toast";
import style from "../../style/page/addProduct.module.css";

const AddCategory = () => {
  const navigate = useNavigate();
  const [categoryName, setCategoryName] = useState("");
  const [measurements, setMeasurements] = useState([]);
  const [selectedMeasurementIds, setSelectedMeasurementIds] = useState(new Set());
  const [loadingMeasurements, setLoadingMeasurements] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "error" });
  const showToast = (message, type = "error") => setToast({ message, type });

  // Fetch all measurement types on mount
  useEffect(() => {
    let isMounted = true;
    const fetchMeas = async () => {
      try {
        const data = await getMeasurements();
        if (isMounted && data && data.measurements) {
          setMeasurements(data.measurements);
        }
      } catch (error) {
        console.error("Failed to load measurements:", error);
      } finally {
        if (isMounted) {
          setLoadingMeasurements(false);
        }
      }
    };
    fetchMeas();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleToggleMeasurement = (id) => {
    setSelectedMeasurementIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    const allIds = new Set(measurements.map((m) => m.id));
    setSelectedMeasurementIds(allIds);
  };

  const handleClearAll = () => {
    setSelectedMeasurementIds(new Set());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!categoryName.trim()) {
      showToast("Please enter a category name.", "error");
      return;
    }

    if (categoryName.trim().length < 2) {
      showToast("Category name must be at least 2 characters long.", "error");
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        categoryName: categoryName.trim(),
        measurementTypeIds: Array.from(selectedMeasurementIds),
      };

      await createCategory(payload);

      showToast("Category created successfully!", "success");

      setTimeout(() => {
        navigate("/dashboard/categories");
      }, 800);
    } catch (error) {
      console.error("Failed to create category:", error);
      const msg =
        error.response?.data?.message ||
        error.response?.data?.errors?.[0]?.message ||
        "Failed to create category. Please verify inputs.";
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
            to="/dashboard/categories"
            className={style.backLink}
            title="Back to Categories"
          >
            <i className="ri-arrow-left-line" style={{ fontSize: "1.25rem" }} />
          </Link>
          <div>
            <h1 className={style.headerTitle}>Add New Category</h1>
            <p className={style.headerSubtitle}>
              Organize products and configure required tailor measurements for this category.
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
            gap: "24px",
          }}
        >
          {/* Category Name Section */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label
              htmlFor="category-name"
              style={{
                fontSize: "0.825rem",
                fontWeight: 600,
                color: "#374151",
              }}
            >
              Category Name <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              id="category-name"
              type="text"
              placeholder="e.g. Shirts, Kurtas, Trousers, Suits, Blazers"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
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
              The display name used across the store catalog and navigation menus.
            </span>
          </div>

          {/* Measurement Types Section */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              <div>
                <label
                  style={{
                    fontSize: "0.825rem",
                    fontWeight: 600,
                    color: "#374151",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span>Required Measurement Types</span>
                  <span
                    style={{
                      background: "#f3f4f6",
                      color: "#4b5563",
                      fontSize: "0.7rem",
                      padding: "2px 8px",
                      borderRadius: "12px",
                      fontWeight: 600,
                    }}
                  >
                    {selectedMeasurementIds.size} Selected
                  </span>
                </label>
                <p style={{ fontSize: "0.75rem", color: "#6b7280", margin: "2px 0 0 0" }}>
                  Select the measurements customers should provide when ordering products in this category.
                </p>
              </div>

              {measurements.length > 0 && (
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    style={{
                      padding: "4px 10px",
                      borderRadius: "4px",
                      border: "1px solid #e5e7eb",
                      background: "#ffffff",
                      color: "#374151",
                      fontSize: "0.75rem",
                      fontWeight: 500,
                      cursor: "pointer",
                    }}
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={handleClearAll}
                    style={{
                      padding: "4px 10px",
                      borderRadius: "4px",
                      border: "1px solid #e5e7eb",
                      background: "#ffffff",
                      color: "#6b7280",
                      fontSize: "0.75rem",
                      fontWeight: 500,
                      cursor: "pointer",
                    }}
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>

            {loadingMeasurements ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "30px",
                  background: "#f9fafb",
                  borderRadius: "6px",
                  color: "#6b7280",
                  fontSize: "0.85rem",
                  gap: "8px",
                }}
              >
                <i className="ri-loader-4-line ri-spin" />
                <span>Loading measurement options...</span>
              </div>
            ) : measurements.length === 0 ? (
              <div
                style={{
                  padding: "20px",
                  background: "#f9fafb",
                  border: "1px dashed #e5e7eb",
                  borderRadius: "6px",
                  textAlign: "center",
                  color: "#6b7280",
                  fontSize: "0.825rem",
                }}
              >
                <p style={{ margin: "0 0 6px 0" }}>
                  No measurement types configured yet.
                </p>
                <Link
                  to="/dashboard/measurements/add"
                  style={{
                    color: "#2563eb",
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  + Add measurement types first
                </Link>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                  gap: "10px",
                }}
              >
                {measurements.map((m) => {
                  const isChecked = selectedMeasurementIds.has(m.id);
                  return (
                    <div
                      key={m.id}
                      onClick={() => handleToggleMeasurement(m.id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "12px 14px",
                        borderRadius: "8px",
                        border: isChecked
                          ? "1.5px solid #111827"
                          : "1px solid #e5e7eb",
                        background: isChecked ? "#f9fafb" : "#ffffff",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                        boxShadow: isChecked
                          ? "0 1px 3px rgba(0,0,0,0.05)"
                          : "none",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        style={{
                          width: "16px",
                          height: "16px",
                          accentColor: "#111827",
                          cursor: "pointer",
                        }}
                      />
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          minWidth: 0,
                        }}
                      >
                        <span
                          style={{
                            fontSize: "0.875rem",
                            fontWeight: isChecked ? 600 : 500,
                            color: "#111827",
                          }}
                        >
                          {m.name}
                        </span>
                        <span
                          style={{
                            fontSize: "0.725rem",
                            color: "#6b7280",
                            textTransform: "uppercase",
                          }}
                        >
                          Unit: {m.unit}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className={style.bottomActions}>
          <Link to="/dashboard/categories" className={style.cancelBtn}>
            Cancel
          </Link>
          <button
            type="submit"
            className={style.submitBtn}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating Category..." : "Save Category"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddCategory;
