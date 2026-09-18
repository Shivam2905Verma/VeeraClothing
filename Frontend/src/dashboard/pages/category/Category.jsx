import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  getCategories,
  deleteCategory,
  updateCategory,
} from "../../service/category.service";
import { getMeasurements } from "../../service/measurement.service";
import ConfirmModal from "../../../common/ConfirmModal";
import Toast from "../../../common/Toast";
import style from "../../style/page/product.module.css";
import cardStyle from "../../style/components/productCard.module.css";
import topBarStyle from "../../style/components/productTopBar.module.css";

const Category = () => {
  const [categories, setCategories] = useState([]);
  const [allMeasurements, setAllMeasurements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState("id");
  const [sortDirection, setSortDirection] = useState("desc");
  const [selectedIds, setSelectedIds] = useState(new Set());

  // Toast State
  const [toast, setToast] = useState({ message: "", type: "error" });
  const showToast = (message, type = "error") => setToast({ message, type });

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState(null);
  const [editCategoryName, setEditCategoryName] = useState("");
  const [editSelectedMeasurementIds, setEditSelectedMeasurementIds] = useState(
    new Set()
  );
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchCategoryList = async () => {
    try {
      setLoading(true);
      const [catData, measData] = await Promise.all([
        getCategories(),
        getMeasurements().catch(() => ({ measurements: [] })),
      ]);

      if (catData && catData.categories) {
        setCategories(catData.categories);
      }
      if (measData && measData.measurements) {
        setAllMeasurements(measData.measurements);
      }
    } catch (error) {
      showToast(
        error?.response?.data?.message || "Failed to load categories.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoryList();
  }, []);

  // Filter & Sort
  const filteredCategories = useMemo(() => {
    let result = [...categories];

    // Search Filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (item) =>
          item.name?.toLowerCase().includes(query) ||
          String(item.id).includes(query) ||
          item.measurements?.some((m) =>
            m.name?.toLowerCase().includes(query)
          )
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
  }, [categories, searchQuery, sortField, sortDirection]);

  // Handle Sort
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Selection Handlers
  const handleToggleSelectAll = () => {
    if (
      selectedIds.size === filteredCategories.length &&
      filteredCategories.length > 0
    ) {
      setSelectedIds(new Set());
    } else {
      const allIds = new Set(filteredCategories.map((c) => c.id));
      setSelectedIds(allIds);
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Open Edit Modal
  const handleOpenEdit = (item) => {
    setCategoryToEdit(item);
    setEditCategoryName(item.name || "");
    const initialMeasIds = new Set(
      (item.measurements || []).map((m) => m.id)
    );
    setEditSelectedMeasurementIds(initialMeasIds);
    setEditModalOpen(true);
  };

  const handleToggleEditMeasurement = (measId) => {
    setEditSelectedMeasurementIds((prev) => {
      const next = new Set(prev);
      if (next.has(measId)) {
        next.delete(measId);
      } else {
        next.add(measId);
      }
      return next;
    });
  };

  // Submit Update
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!editCategoryName.trim()) {
      showToast("Category name cannot be empty.", "error");
      return;
    }

    try {
      setIsUpdating(true);
      const selectedMeasArray = Array.from(editSelectedMeasurementIds);
      await updateCategory(categoryToEdit.id, {
        categoryName: editCategoryName.trim(),
        measurementTypeIds: selectedMeasArray,
      });

      // Update local state
      const updatedMeasurements = allMeasurements.filter((m) =>
        editSelectedMeasurementIds.has(m.id)
      );

      setCategories((prev) =>
        prev.map((c) =>
          c.id === categoryToEdit.id
            ? {
                ...c,
                name: editCategoryName.trim(),
                measurements: updatedMeasurements,
              }
            : c
        )
      );

      showToast(`Category "${editCategoryName}" updated successfully.`, "success");
      setEditModalOpen(false);
      setCategoryToEdit(null);
    } catch (error) {
      showToast(
        error?.response?.data?.message || "Failed to update category.",
        "error"
      );
    } finally {
      setIsUpdating(false);
    }
  };

  // Open Delete Modal
  const handleOpenDelete = (item) => {
    setCategoryToDelete(item);
    setDeleteModalOpen(true);
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    try {
      setIsDeleting(true);
      await deleteCategory(categoryToDelete.id);
      setCategories((prev) =>
        prev.filter((item) => item.id !== categoryToDelete.id)
      );
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(categoryToDelete.id);
        return next;
      });
      showToast(`Category "${categoryToDelete.name}" deleted.`, "success");
      setDeleteModalOpen(false);
      setCategoryToDelete(null);
    } catch (error) {
      showToast(
        error?.response?.data?.message ||
          "Cannot delete category because there are active products assigned to it.",
        "error"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const isAllSelected =
    filteredCategories.length > 0 &&
    selectedIds.size === filteredCategories.length;

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
            <h1 className={topBarStyle.pageTitle}>Categories</h1>
            <span className={topBarStyle.countBadge}>{categories.length}</span>
          </div>

          <Link
            to="/dashboard/categories/add"
            className={topBarStyle.primaryActionBtn}
          >
            <i className="ri-add-line" style={{ fontSize: "1rem" }} />
            <span>Add Category</span>
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
                placeholder="Filter categories..."
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

          <div className={topBarStyle.toolbarRight}>
            <button
              type="button"
              className={topBarStyle.viewBtn}
              onClick={fetchCategoryList}
              title="Refresh Data"
            >
              <i className="ri-refresh-line" style={{ fontSize: "0.95rem" }} />
            </button>
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
      ) : filteredCategories.length === 0 ? (
        <div className={style.emptyContainer}>
          <div className={style.emptyIcon}>
            <i className="ri-folders-line" style={{ fontSize: "2.5rem" }} />
          </div>
          <h3 className={style.emptyTitle}>No Categories Found</h3>
          <p className={style.emptySubtitle}>
            {searchQuery
              ? `No category matches "${searchQuery}". Try another search.`
              : "No categories in inventory yet. Click 'Add Category' to get started."}
          </p>
        </div>
      ) : (
        <div className={style.tableWrapper}>
          <table className={style.table}>
            <thead>
              <tr className={style.tableHeaderRow}>
                {/* Checkbox Header */}
                <th className={style.checkboxHeader}>
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleToggleSelectAll}
                    className={style.headerCheckbox}
                  />
                </th>

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

                {/* Category Name */}
                <th
                  className={`${style.tableHeader} ${style.sortableHeader}`}
                  onClick={() => handleSort("name")}
                  style={{ width: "240px" }}
                >
                  <div className={style.headerContent}>
                    <span>Category</span>
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

                {/* Required Measurements Column */}
                <th className={style.tableHeader}>
                  <div className={style.headerContent}>
                    <span>Required Measurements</span>
                  </div>
                </th>

                {/* Actions Header */}
                <th className={`${style.tableHeader} ${style.actionsHeader}`}>
                  <span>Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.map((category) => (
                <tr
                  key={category.id}
                  className={`${cardStyle.tableRow} ${
                    selectedIds.has(category.id) ? cardStyle.rowSelected : ""
                  }`}
                >
                  {/* Checkbox */}
                  <td className={cardStyle.checkboxCell}>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(category.id)}
                      onChange={() => handleToggleSelect(category.id)}
                      className={cardStyle.rowCheckbox}
                    />
                  </td>

                  {/* ID */}
                  <td className={cardStyle.categoryCell}>
                    <span className={cardStyle.productId}>
                      CAT-{String(category.id).padStart(4, "0")}
                    </span>
                  </td>

                  {/* Category Name */}
                  <td className={cardStyle.productCell}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
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
                        <i className="ri-folder-3-line" />
                      </div>
                      <span style={{ fontWeight: 600, color: "#111827" }}>
                        {category.name}
                      </span>
                    </div>
                  </td>

                  {/* Required Measurements Badges */}
                  <td className={cardStyle.categoryCell}>
                    {category.measurements && category.measurements.length > 0 ? (
                      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                        {category.measurements.map((m) => (
                          <span
                            key={m.id}
                            style={{
                              background: "#f3f4f6",
                              color: "#374151",
                              padding: "2px 8px",
                              borderRadius: "4px",
                              fontSize: "0.75rem",
                              fontWeight: 500,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            <i className="ri-ruler-line" style={{ fontSize: "0.75rem", color: "#6b7280" }} />
                            <span>{m.name}</span>
                            <span style={{ color: "#9ca3af", fontSize: "0.7rem" }}>
                              ({m.unit})
                            </span>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span style={{ color: "#9ca3af", fontSize: "0.8rem", fontStyle: "italic" }}>
                        No measurements required
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className={cardStyle.actionsCell}>
                    <div className={cardStyle.actionButtons}>
                      {/* Edit */}
                      <button
                        type="button"
                        className={cardStyle.actionIconBtn}
                        onClick={() => handleOpenEdit(category)}
                        title="Edit Category"
                      >
                        <i className="ri-edit-line" />
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        className={`${cardStyle.actionIconBtn} ${cardStyle.deleteActionBtn}`}
                        onClick={() => handleOpenDelete(category)}
                        title="Delete Category"
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
              Showing {filteredCategories.length} of {categories.length} categories
              {selectedIds.size > 0 && ` (${selectedIds.size} selected)`}
            </span>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
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
              maxWidth: "480px",
              padding: "24px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
              maxHeight: "90vh",
              overflowY: "auto",
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
              <h3 style={{ fontSize: "1.1rem", fontWeight: 600, color: "#111827" }}>
                Edit Category
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

            <form onSubmit={handleUpdateSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
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
                  Category Name
                </label>
                <input
                  type="text"
                  value={editCategoryName}
                  onChange={(e) => setEditCategoryName(e.target.value)}
                  required
                  placeholder="e.g. Shirts"
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
                    marginBottom: "8px",
                  }}
                >
                  Required Measurement Types
                </label>

                {allMeasurements.length === 0 ? (
                  <p style={{ fontSize: "0.8rem", color: "#6b7280" }}>
                    No measurement types available yet.
                  </p>
                ) : (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
                      gap: "8px",
                      maxHeight: "200px",
                      overflowY: "auto",
                      padding: "4px",
                    }}
                  >
                    {allMeasurements.map((m) => {
                      const isSelected = editSelectedMeasurementIds.has(m.id);
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => handleToggleEditMeasurement(m.id)}
                          style={{
                            padding: "8px 10px",
                            borderRadius: "6px",
                            border: isSelected
                              ? "1px solid #111827"
                              : "1px solid #e5e7eb",
                            background: isSelected ? "#f3f4f6" : "#ffffff",
                            color: "#111827",
                            textAlign: "left",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            fontSize: "0.8rem",
                            fontWeight: isSelected ? 600 : 400,
                            transition: "all 0.15s ease",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            readOnly
                            style={{ accentColor: "#111827", cursor: "pointer" }}
                          />
                          <div style={{ display: "flex", flexDirection: "column" }}>
                            <span>{m.name}</span>
                            <span style={{ fontSize: "0.7rem", color: "#6b7280" }}>
                              {m.unit}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                  marginTop: "8px",
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
        title="Delete Category"
        message={`Are you sure you want to delete category "${categoryToDelete?.name}"? You cannot delete a category if products are assigned to it.`}
        confirmText="Delete Category"
        cancelText="Cancel"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          if (!isDeleting) {
            setDeleteModalOpen(false);
            setCategoryToDelete(null);
          }
        }}
      />
    </div>
  );
};

export default Category;
