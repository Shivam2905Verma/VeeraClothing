import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  getMeasurements,
  deleteMeasurement,
  updateMeasurement,
} from "../../service/measurement.service";
import ConfirmModal from "../../../common/ConfirmModal";
import Toast from "../../../common/Toast";
import style from "../../style/page/product.module.css";
import cardStyle from "../../style/components/productCard.module.css";
import topBarStyle from "../../style/components/productTopBar.module.css";

const Measurement = () => {
  const [measurements, setMeasurements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState("id");
  const [sortDirection, setSortDirection] = useState("desc");

  // Toast State
  const [toast, setToast] = useState({ message: "", type: "error" });
  const showToast = (message, type = "error") => setToast({ message, type });

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [measurementToDelete, setMeasurementToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [measurementToEdit, setMeasurementToEdit] = useState(null);
  const [editFormData, setEditFormData] = useState({ name: "", unit: "" });
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchMeasurementList = async () => {
    try {
      setLoading(true);
      const data = await getMeasurements();
      if (data && data.measurements) {
        setMeasurements(data.measurements);
      }
    } catch (error) {
      showToast(
        error?.response?.data?.message || "Failed to load measurements.",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeasurementList();
  }, []);

  // Filter & Sort
  const filteredMeasurements = useMemo(() => {
    let result = [...measurements];

    // Search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (item) =>
          item.name?.toLowerCase().includes(query) ||
          item.unit?.toLowerCase().includes(query) ||
          String(item.id).includes(query),
      );
    }

    // Sorting
    result.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (typeof aVal === "string") {
        aVal = aVal.toLowerCase();
        bVal = (bVal || "").toLowerCase();
      }

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [measurements, searchQuery, sortField, sortDirection]);

  // Handle Sort
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (item) => {
    setMeasurementToEdit(item);
    setEditFormData({ name: item.name, unit: item.unit });
    setEditModalOpen(true);
  };

  // Handle Update Submit
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!editFormData.name.trim() || !editFormData.unit.trim()) {
      showToast("Please fill in both name and unit.", "error");
      return;
    }

    try {
      setIsUpdating(true);
      await updateMeasurement(measurementToEdit.id, {
        name: editFormData.name.trim(),
        unit: editFormData.unit.trim(),
      });

      setMeasurements((prev) =>
        prev.map((m) =>
          m.id === measurementToEdit.id
            ? {
                ...m,
                name: editFormData.name.trim(),
                unit: editFormData.unit.trim(),
              }
            : m,
        ),
      );

      showToast(
        `Measurement "${editFormData.name}" updated successfully.`,
        "success",
      );
      setEditModalOpen(false);
      setMeasurementToEdit(null);
    } catch (error) {
      showToast(
        error?.response?.data?.message || "Failed to update measurement.",
        "error",
      );
    } finally {
      setIsUpdating(false);
    }
  };

  // Open Delete Modal
  const handleOpenDelete = (item) => {
    setMeasurementToDelete(item);
    setDeleteModalOpen(true);
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!measurementToDelete) return;
    try {
      setIsDeleting(true);
      await deleteMeasurement(measurementToDelete.id);
      setMeasurements((prev) =>
        prev.filter((item) => item.id !== measurementToDelete.id),
      );
      showToast(
        `Measurement "${measurementToDelete.name}" deleted.`,
        "success",
      );
      setDeleteModalOpen(false);
      setMeasurementToDelete(null);
    } catch (error) {
      showToast(
        error?.response?.data?.message ||
          "Cannot delete measurement type because it is linked to categories or orders.",
        "error",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className={style.productPage}>
      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "error" })}
        duration={4000}
      />

      {/* TOP BAR Component */}
      <div>
        {/* Header Row */}
        <div className={topBarStyle.headerRow}>
          <div className={topBarStyle.titleArea}>
            <h1 className={topBarStyle.pageTitle}>Measurements</h1>
            <span className={topBarStyle.countBadge}>
              {measurements.length}
            </span>
          </div>

          <Link
            to="/dashboard/measurements/add"
            className={topBarStyle.primaryActionBtn}
          >
            <i className="ri-add-line" style={{ fontSize: "1rem" }} />
            <span>
              Add <span className={topBarStyle.btnSuffix}>Measurement</span>
            </span>
          </Link>
        </div>

        {/* Toolbar Row */}
        <div className={topBarStyle.toolbarRow}>
          <div className={topBarStyle.toolbarLeft}>
            <div className={topBarStyle.filterInputWrapper}>
              <span className={topBarStyle.filterIcon}>
                <i className="ri-search-line" />
              </span>
              <input
                type="text"
                placeholder="Filter measurements..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={topBarStyle.filterInput}
              />
              {searchQuery && (
                <button
                  type="button"
                  className={topBarStyle.clearBtn}
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear filter"
                >
                  <i className="ri-close-line" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* TABLE */}
      {loading ? (
        <div className={style.loadingSpinner}>
          <i
            className="ri-loader-4-line ri-spin"
            style={{ fontSize: "1.75rem", color: "#6b7280" }}
          />
        </div>
      ) : filteredMeasurements.length === 0 ? (
        <div className={style.emptyContainer}>
          <div className={style.emptyIcon}>
            <i className="ri-ruler-2-line" style={{ fontSize: "2.5rem" }} />
          </div>
          <h3 className={style.emptyTitle}>No Measurements Found</h3>
          <p className={style.emptySubtitle}>
            {searchQuery
              ? `No measurement matches "${searchQuery}". Try another search.`
              : "No measurement types defined yet. Click 'Add Measurement' to create one."}
          </p>
        </div>
      ) : (
        <div className={style.tableWrapper}>
          <table className={style.table}>
            <thead>
              <tr className={style.tableHeaderRow}>
                {/* ID Header */}
                <th
                  className={`${style.tableHeader} ${style.sortableHeader}`}
                  onClick={() => handleSort("id")}
                  style={{ width: "120px" }}
                >
                  <div className={style.headerContent}>
                    <span>ID</span>
                    {sortField === "id" && (
                      <i
                        className={
                          sortDirection === "asc"
                            ? "ri-arrow-up-line"
                            : "ri-arrow-down-line"
                        }
                      />
                    )}
                  </div>
                </th>

                {/* Measurement Name */}
                <th
                  className={`${style.tableHeader} ${style.sortableHeader}`}
                  onClick={() => handleSort("name")}
                >
                  <div className={style.headerContent}>
                    <span>Measurement Type</span>
                    {sortField === "name" && (
                      <i
                        className={
                          sortDirection === "asc"
                            ? "ri-arrow-up-line"
                            : "ri-arrow-down-line"
                        }
                      />
                    )}
                  </div>
                </th>

                {/* Unit Header */}
                <th
                  className={`${style.tableHeader} ${style.sortableHeader}`}
                  onClick={() => handleSort("unit")}
                  style={{ width: "160px" }}
                >
                  <div className={style.headerContent}>
                    <span>Standard Unit</span>
                    {sortField === "unit" && (
                      <i
                        className={
                          sortDirection === "asc"
                            ? "ri-arrow-up-line"
                            : "ri-arrow-down-line"
                        }
                      />
                    )}
                  </div>
                </th>

                {/* Actions Header */}
                <th className={`${style.tableHeader} ${style.actionsHeader}`}>
                  <span>Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredMeasurements.map((item) => (
                <tr key={item.id} className={cardStyle.tableRow}>
                  {/* ID */}
                  <td className={cardStyle.categoryCell}>
                    <span className={cardStyle.productId}>
                      MST-{String(item.id).padStart(4, "0")}
                    </span>
                  </td>

                  {/* Measurement Name */}
                  <td className={cardStyle.productCell}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <div
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "6px",
                          background: "#f3f4f6",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#4b5563",
                          fontSize: "1rem",
                        }}
                      >
                        <i className="ri-ruler-line" />
                      </div>
                      <span style={{ fontWeight: 600, color: "#111827" }}>
                        {item.name}
                      </span>
                    </div>
                  </td>

                  {/* Unit */}
                  <td className={cardStyle.categoryCell}>
                    <span
                      style={{
                        background: "#e0f2fe",
                        color: "#0369a1",
                        padding: "3px 10px",
                        borderRadius: "12px",
                        fontSize: "0.775rem",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.03em",
                      }}
                    >
                      {item.unit}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className={cardStyle.actionsCell}>
                    <div className={cardStyle.actionButtons}>
                      {/* Edit */}
                      <button
                        type="button"
                        className={cardStyle.actionIconBtn}
                        onClick={() => handleOpenEdit(item)}
                        title="Edit Measurement"
                      >
                        <i className="ri-edit-line" />
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        className={`${cardStyle.actionIconBtn} ${cardStyle.deleteActionBtn}`}
                        onClick={() => handleOpenDelete(item)}
                        title="Delete Measurement"
                      >
                        <i className="ri-delete-bin-line" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Footer */}
          <div className={style.tableFooter}>
            <span className={style.footerInfo}>
              Showing {filteredMeasurements.length} of {measurements.length}{" "}
              measurements
            </span>
          </div>
        </div>
      )}

      {/* Edit Measurement Modal */}
      {editModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: "16px",
          }}
          onClick={() => !isUpdating && setEditModalOpen(false)}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "10px",
              width: "100%",
              maxWidth: "420px",
              padding: "24px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "18px",
              }}
            >
              <h3
                style={{
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  color: "#111827",
                }}
              >
                Edit Measurement
              </h3>
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#9ca3af",
                  cursor: "pointer",
                  fontSize: "1.2rem",
                }}
              >
                <i className="ri-close-line" />
              </button>
            </div>

            <form
              onSubmit={handleUpdateSubmit}
              style={{ display: "flex", flexDirection: "column", gap: "14px" }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    color: "#374151",
                    marginBottom: "6px",
                  }}
                >
                  Measurement Name
                </label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  required
                  placeholder="e.g. Chest"
                  style={{
                    width: "100%",
                    height: "38px",
                    padding: "0 10px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "0.875rem",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    color: "#374151",
                    marginBottom: "6px",
                  }}
                >
                  Standard Unit
                </label>
                <input
                  type="text"
                  value={editFormData.unit}
                  onChange={(e) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      unit: e.target.value,
                    }))
                  }
                  required
                  placeholder="e.g. in or cm"
                  style={{
                    width: "100%",
                    height: "38px",
                    padding: "0 10px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "0.875rem",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                  marginTop: "10px",
                }}
              >
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  disabled={isUpdating}
                  style={{
                    padding: "8px 14px",
                    borderRadius: "6px",
                    border: "1px solid #d1d5db",
                    background: "#ffffff",
                    color: "#374151",
                    fontSize: "0.85rem",
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "6px",
                    border: "none",
                    background: "#111827",
                    color: "#ffffff",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  {isUpdating ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Measurement"
        message={`Are you sure you want to delete measurement "${measurementToDelete?.name}"? If it is linked to categories or past orders, it cannot be deleted.`}
        confirmText="Delete Measurement"
        cancelText="Cancel"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          if (!isDeleting) {
            setDeleteModalOpen(false);
            setMeasurementToDelete(null);
          }
        }}
      />
    </div>
  );
};

export default Measurement;
