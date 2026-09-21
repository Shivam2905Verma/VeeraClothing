import style from "../../../style/components/addProductVariantsSection.module.css";

const AddProductVariantsSection = ({
  variants,
  setVariants,
  showToast,
}) => {
  // Add new Variant row
  const handleAddVariant = () => {
    setVariants((prev) => [
      ...prev,
      { id: Date.now(), color: "", price: "", stock: "" },
    ]);
  };

  // Update a field inside a variant
  const handleVariantChange = (index, field, value) => {
    setVariants((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Remove a variant row (keep at least 1)
  const handleRemoveVariant = (index) => {
    if (variants.length <= 1) {
      showToast("At least one variant is required for a product.", "error");
      return;
    }
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className={style.formCard} style={{ marginTop: "24px" }}>
      <div className={style.cardHeader}>
        <div>
          <h2 className={style.cardTitle}>Product Variants</h2>
          <p className={style.cardSubtitle}>
            Add color variants with specific price and stock amounts
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddVariant}
          className={style.addVariantBtn}
        >
          <i className="ri-add-line" style={{ fontSize: "1.1rem" }} />
          <span>
            Add <span className={style.btnSuffix}>Variant</span>
          </span>
        </button>
      </div>

      <div className={style.variantsContainer}>
        {variants.map((v, index) => (
          <div key={v.id || index} className={style.variantRow}>
            <div className={style.variantCol}>
              <label className={style.variantLabel}>
                Color {index + 1} *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Navy Blue / Olive / White"
                value={v.color}
                onChange={(e) =>
                  handleVariantChange(index, "color", e.target.value)
                }
                className={style.variantInput}
              />
            </div>

            <div className={style.variantCol}>
              <label className={style.variantLabel}>Price (₹) *</label>
              <input
                type="number"
                min="1"
                required
                placeholder="e.g. 799"
                value={v.price}
                onChange={(e) =>
                  handleVariantChange(index, "price", e.target.value)
                }
                className={style.variantInput}
              />
            </div>

            <div className={style.variantCol}>
              <label className={style.variantLabel}>Stock *</label>
              <input
                type="number"
                min="0"
                required
                placeholder="e.g. 50"
                value={v.stock}
                onChange={(e) =>
                  handleVariantChange(index, "stock", e.target.value)
                }
                className={style.variantInput}
              />
            </div>

            <div className={style.variantDeleteCol}>
              <button
                type="button"
                onClick={() => handleRemoveVariant(index)}
                disabled={variants.length <= 1}
                className={style.removeVariantBtn}
                title="Remove this variant"
              >
                <i className="ri-delete-bin-line" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AddProductVariantsSection;
