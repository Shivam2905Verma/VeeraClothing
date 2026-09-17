import { useState } from "react";
import {
  updateVariant,
  deleteVariant,
} from "../../../service/product.service";
import ConfirmModal from "../../../../common/ConfirmModal";
import style from "../../../style/components/editProductVariantsSection.module.css";

const EditProductVariantsSection = ({
  variants,
  setVariants,
  showToast,
}) => {
  // Editing state for accordion
  const [editingVariantId, setEditingVariantId] = useState(null);
  const [editVariantForm, setEditVariantForm] = useState({
    color: "",
    price: "",
    stock: "",
  });
  const [isSavingVariant, setIsSavingVariant] = useState(false);

  // Variant Delete Modal State
  const [deleteVariantModalOpen, setDeleteVariantModalOpen] = useState(false);
  const [variantToDelete, setVariantToDelete] = useState(null);
  const [isDeletingVariant, setIsDeletingVariant] = useState(false);

  // Toggle edit mode for a variant
  const handleToggleEditVariant = (variant) => {
    if (editingVariantId === variant.id) {
      setEditingVariantId(null);
    } else {
      setEditingVariantId(variant.id);
      setEditVariantForm({
        color: variant.color || "",
        price: variant.price !== undefined ? String(variant.price) : "",
        stock: variant.stock !== undefined ? String(variant.stock) : "",
      });
    }
  };

  // Handle edit form change
  const handleEditVariantFormChange = (field, value) => {
    setEditVariantForm((prev) => ({ ...prev, [field]: value }));
  };

  // Save changes for a variant
  const handleSaveVariant = async (variantId) => {
    if (!editVariantForm.color.trim()) {
      showToast("Color name cannot be empty.", "error");
      return;
    }

    const priceNum = Number(editVariantForm.price);
    if (isNaN(priceNum) || priceNum <= 0) {
      showToast("Price must be a valid positive number.", "error");
      return;
    }

    const stockNum = Number(editVariantForm.stock);
    if (isNaN(stockNum) || stockNum < 0) {
      showToast("Stock must be a non-negative number.", "error");
      return;
    }

    try {
      setIsSavingVariant(true);
      const updateData = {
        color: editVariantForm.color.trim(),
        price: priceNum,
        stock: stockNum,
      };

      await updateVariant(variantId, updateData);
      showToast("Variant updated successfully!", "success");

      setVariants((prev) =>
        prev.map((v) =>
          v.id === variantId
            ? {
                ...v,
                color: updateData.color,
                price: updateData.price,
                stock: updateData.stock,
              }
            : v,
        ),
      );

      setEditingVariantId(null);
    } catch (error) {
      console.error("Failed to update variant:", error);
      const msg =
        error.response?.data?.message ||
        error.response?.data?.errors?.[0]?.message ||
        "Failed to update variant. Please try again.";
      showToast(msg, "error");
    } finally {
      setIsSavingVariant(false);
    }
  };

  // Open delete variant confirmation modal
  const handleOpenDeleteVariantModal = (variant) => {
    if (variants.length <= 1) {
      showToast("Cannot delete the only variant of this product.", "error");
      return;
    }
    setVariantToDelete(variant);
    setDeleteVariantModalOpen(true);
  };

  // Confirm delete variant
  const handleConfirmDeleteVariant = async () => {
    if (!variantToDelete) return;

    try {
      setIsDeletingVariant(true);
      await deleteVariant(variantToDelete.id);
      showToast("Variant deleted successfully!", "success");

      setVariants((prev) => prev.filter((v) => v.id !== variantToDelete.id));

      if (editingVariantId === variantToDelete.id) {
        setEditingVariantId(null);
      }

      setDeleteVariantModalOpen(false);
      setVariantToDelete(null);
    } catch (error) {
      console.error("Failed to delete variant:", error);
      const msg =
        error.response?.data?.message ||
        "Failed to delete variant. Please try again.";
      showToast(msg, "error");
    } finally {
      setIsDeletingVariant(false);
    }
  };

  // Cancel delete variant
  const handleCancelDeleteVariant = () => {
    if (isDeletingVariant) return;
    setDeleteVariantModalOpen(false);
    setVariantToDelete(null);
  };

  return (
    <>
      <ConfirmModal
        isOpen={deleteVariantModalOpen}
        title="Delete Product Variant"
        message={`Are you sure you want to delete the variant "${variantToDelete?.color}" (₹${variantToDelete?.price})? This will permanently remove it from the database.`}
        confirmText="Yes, Delete Variant"
        cancelText="Cancel"
        onConfirm={handleConfirmDeleteVariant}
        onCancel={handleCancelDeleteVariant}
        isDestructive={true}
        isLoading={isDeletingVariant}
      />

      {/* SECTION: PRODUCT VARIANTS */}
      <div className={style.formCard} style={{ marginTop: "24px" }}>
        <div className={style.cardHeader}>
          <div>
            <h2 className={style.cardTitle}>Product Variants</h2>
            <p className={style.cardSubtitle}>
              Manage color variants, pricing, and available stock levels.
            </p>
          </div>
        </div>

        {variants.length === 0 ? (
          <div className={style.emptyVariants}>
            <i className={`ri-stack-line ${style.emptyIcon}`} />
            No variants configured for this product.
          </div>
        ) : (
          <div className={style.variantCardsList}>
            {variants.map((v) => {
              const isEditing = editingVariantId === v.id;
              const isOutOfStock = Number(v.stock) <= 0;

              // Check if user changed anything during edit
              const isChanged =
                isEditing &&
                (editVariantForm.color.trim() !== v.color ||
                  Number(editVariantForm.price) !== Number(v.price) ||
                  Number(editVariantForm.stock) !== Number(v.stock)) &&
                editVariantForm.color.trim().length > 0 &&
                Number(editVariantForm.price) > 0 &&
                Number(editVariantForm.stock) >= 0;

              return (
                <div key={v.id} className={style.variantCard}>
                  {/* Card Header Summary */}
                  <div
                    className={`${style.variantCardHeader} ${
                      isEditing ? style.variantCardHeaderActive : ""
                    }`}
                  >
                    <div className={style.variantInfoLeft}>
                      <div className={style.variantColorBadge}>
                        {v.color ? v.color.charAt(0).toUpperCase() : "V"}
                      </div>
                      <div>
                        <span className={style.variantColorName}>{v.color}</span>
                      </div>
                      <span className={style.variantMetaBadge}>
                        ₹{Number(v.price).toLocaleString()}
                      </span>
                      <span
                        className={
                          isOutOfStock
                            ? style.stockOutBadge
                            : style.stockInBadge
                        }
                      >
                        {isOutOfStock ? "Out of Stock" : `${v.stock} in stock`}
                      </span>
                    </div>

                    <div className={style.variantActions}>
                      <button
                        type="button"
                        className={`${style.editVariantBtn} ${
                          isEditing ? style.editVariantBtnActive : ""
                        }`}
                        onClick={() => handleToggleEditVariant(v)}
                        title={isEditing ? "Close Edit Panel" : "Edit Variant"}
                      >
                        <i
                          className={
                            isEditing ? "ri-close-line" : "ri-edit-line"
                          }
                        />
                        <span>{isEditing ? "Close" : "Edit"}</span>
                      </button>
                      <button
                        type="button"
                        className={style.deleteVariantBtn}
                        onClick={() => handleOpenDeleteVariantModal(v)}
                        title="Delete Variant"
                      >
                        <i className="ri-delete-bin-line" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>

                  {/* Sliding Edit Panel (3 Inputs) */}
                  <div
                    className={`${style.variantSlidePanel} ${
                      isEditing ? style.variantSlidePanelOpen : ""
                    }`}
                  >
                    <div className={style.variantInputsGrid}>
                      <div
                        className={style.formGroup}
                        style={{ marginBottom: 0 }}
                      >
                        <label className={style.formLabel}>Color Name *</label>
                        <input
                          type="text"
                          placeholder="e.g. Navy Blue"
                          value={isEditing ? editVariantForm.color : ""}
                          onChange={(e) =>
                            handleEditVariantFormChange(
                              "color",
                              e.target.value,
                            )
                          }
                          className={style.formInput}
                        />
                      </div>

                      <div
                        className={style.formGroup}
                        style={{ marginBottom: 0 }}
                      >
                        <label className={style.formLabel}>Price (₹) *</label>
                        <input
                          type="number"
                          min="1"
                          placeholder="e.g. 799"
                          value={isEditing ? editVariantForm.price : ""}
                          onChange={(e) =>
                            handleEditVariantFormChange(
                              "price",
                              e.target.value,
                            )
                          }
                          className={style.formInput}
                        />
                      </div>

                      <div
                        className={style.formGroup}
                        style={{ marginBottom: 0 }}
                      >
                        <label className={style.formLabel}>Stock *</label>
                        <input
                          type="number"
                          min="0"
                          placeholder="e.g. 50"
                          value={isEditing ? editVariantForm.stock : ""}
                          onChange={(e) =>
                            handleEditVariantFormChange(
                              "stock",
                              e.target.value,
                            )
                          }
                          className={style.formInput}
                        />
                      </div>
                    </div>

                    <div className={style.variantSlideActions}>
                      <button
                        type="button"
                        onClick={() => setEditingVariantId(null)}
                        className={style.variantCancelBtn}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveVariant(v.id)}
                        disabled={!isChanged || isSavingVariant}
                        className={style.variantSaveBtn}
                        title={
                          !isChanged
                            ? "Change variant details to enable save"
                            : "Save and change variant"
                        }
                      >
                        {isSavingVariant && editingVariantId === v.id ? (
                          <>
                            <i className="ri-loader-4-line ri-spin" />
                            <span>Saving...</span>
                          </>
                        ) : (
                          <>
                            <i className="ri-check-line" />
                            <span>Save and Change</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default EditProductVariantsSection;
