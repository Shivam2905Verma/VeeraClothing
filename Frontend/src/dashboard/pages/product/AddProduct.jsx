import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createProduct } from "../../service/product.service";
import Toast from "../../../common/Toast";
import style from "../../style/page/addProduct.module.css";
import { getCategories } from "../../service/category.service";

const TOTAL_IMAGE_SLOTS = 5;

const AddProduct = () => {
  const navigate = useNavigate();

  // Form Fields
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category_id: "",
    highlights: "",
    composition: "",
    care: "",
    extra_info: "",
  });

  // 5 Image Upload Slots (each is null or { file: File, preview: string })
  const [images, setImages] = useState(Array(TOTAL_IMAGE_SLOTS).fill(null));

  // Variants Array (each has unique local id, color, price, stock)
  const [variants, setVariants] = useState([
    { id: 1, color: "", price: "", stock: "" },
  ]);

  // Categories Dropdown Data
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Status & Feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "error" });
  const showToast = (message, type = "error") => setToast({ message, type });

  // Fetch categories on mount
  useEffect(() => {
    let isMounted = true;
    const fetchCat = async () => {
      try {
        const data = await getCategories();
        if (isMounted && data && data.categories) {
          setCategories(data.categories);
        }
      } catch (error) {
        console.error("Failed to load categories:", error);
      } finally {
        if (isMounted) {
          setCategoriesLoading(false);
        }
      }
    };
    fetchCat();
    return () => {
      isMounted = false;
    };
  }, []);

  // Cleanup object URLs on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      images.forEach((img) => {
        if (img && img.preview) {
          URL.revokeObjectURL(img.preview);
        }
      });
    };
  }, [images]);

  // Handle standard text inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle Image Upload for a specific slot
  const handleImageChange = (index, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast("Image size must be less than 5MB.", "error");
      return;
    }

    const preview = URL.createObjectURL(file);

    setImages((prev) => {
      const updated = [...prev];
      if (updated[index]?.preview) {
        URL.revokeObjectURL(updated[index].preview);
      }
      updated[index] = { file, preview };
      return updated;
    });
  };

  // Remove image from a specific slot
  const handleRemoveImage = (index, e) => {
    e.stopPropagation();
    setImages((prev) => {
      const updated = [...prev];
      if (updated[index]?.preview) {
        URL.revokeObjectURL(updated[index].preview);
      }
      updated[index] = null;
      return updated;
    });
  };

  // Add new Variant row
  const handleAddVariant = () => {
    setVariants((prev) => [...prev, { color: "", price: "", stock: "" }]);
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

  // Form Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Validation: At least one image is attached
    const attachedImages = images.filter((img) => img !== null);
    if (attachedImages.length === 0) {
      showToast(
        "Please attach at least one product image in the image boxes.",
        "error",
      );
      return;
    }

    // 2. Validation: Category selection
    if (!formData.category_id) {
      showToast("Please select a category for this product.", "error");
      return;
    }

    // 3. Validation: Variants
    for (let i = 0; i < variants.length; i++) {
      const v = variants[i];
      if (!v.color.trim()) {
        showToast(`Please enter a color for Variant #${i + 1}.`, "error");
        return;
      }
      if (!v.price || Number(v.price) <= 0) {
        showToast(
          `Please enter a valid price (> 0) for Variant #${i + 1}.`,
          "error",
        );
        return;
      }
      if (v.stock === "" || Number(v.stock) < 0) {
        showToast(
          `Please enter valid stock (>= 0) for Variant #${i + 1}.`,
          "error",
        );
        return;
      }
    }

    try {
      setIsSubmitting(true);

      const submissionPayload = new FormData();
      submissionPayload.append("name", formData.name.trim());
      submissionPayload.append("description", formData.description.trim());
      submissionPayload.append("category_id", formData.category_id);
      submissionPayload.append("highlights", formData.highlights.trim());
      submissionPayload.append("composition", formData.composition.trim());
      submissionPayload.append("care", formData.care.trim());
      submissionPayload.append("extra_info", formData.extra_info.trim());

      // Format variants array
      const formattedVariants = variants.map((v) => ({
        color: v.color.trim(),
        price: Number(v.price),
        stock: Number(v.stock),
      }));
      submissionPayload.append("variants", JSON.stringify(formattedVariants));

      // Append all attached images
      attachedImages.forEach((img) => {
        submissionPayload.append("images", img.file);
      });

      await createProduct(submissionPayload);

      showToast("Product created successfully!", "success");

      // Redirect after brief delay
      setTimeout(() => {
        navigate("/dashboard/products");
      }, 1000);
    } catch (error) {
      console.error("Failed to create product:", error);
      const msg =
        error.response?.data?.message ||
        error.response?.data?.errors?.[0]?.message ||
        "Failed to create product. Please verify all inputs.";
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
        duration={7000}
      />

      {/* Top Header Bar */}
      <div className={style.headerBar}>
        <div className={style.headerLeft}>
          <Link
            to="/dashboard/products"
            className={style.backLink}
            title="Back to Products"
          >
            <i className="ri-arrow-left-line" style={{ fontSize: "1.25rem" }} />
          </Link>
          <div>
            <h1 className={style.headerTitle}>Add New Product</h1>
            <p className={style.headerSubtitle}>
              Fill in product details, attach up to 5 images, and configure
              variants.
            </p>
          </div>
        </div>

        <div className={style.headerActions}>
          <Link to="/dashboard/products" className={style.cancelBtn}>
            Cancel
          </Link>
          <button
            type="button"
            onClick={handleSubmit}
            className={style.submitBtn}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <i
                  className="ri-loader-4-line ri-spin"
                  style={{ fontSize: "1.1rem" }}
                />
                <span>Creating Product...</span>
              </>
            ) : (
              <>
                <i className="ri-check-line" style={{ fontSize: "1.1rem" }} />
                <span>Save Product</span>
              </>
            )}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* SECTION 1: BASIC INFORMATION */}
        <div className={style.formCard}>
          <div className={style.cardHeader}>
            <div>
              <h2 className={style.cardTitle}>Basic Information</h2>
              <p className={style.cardSubtitle}>
                General product details and assigned category
              </p>
            </div>
          </div>

          <div className={style.grid2}>
            <div className={style.formGroup}>
              <label htmlFor="name" className={style.formLabel}>
                Product Name *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                placeholder="e.g. Classic Oxford Cotton Shirt"
                value={formData.name}
                onChange={handleInputChange}
                className={style.formInput}
              />
            </div>

            <div className={style.formGroup}>
              <label htmlFor="category_id" className={style.formLabel}>
                Category *
              </label>
              <select
                id="category_id"
                name="category_id"
                required
                value={formData.category_id}
                onChange={handleInputChange}
                className={style.formSelect}
              >
                <option value="">
                  {categoriesLoading
                    ? "Loading categories..."
                    : "-- Select Product Category --"}
                </option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={style.formGroup}>
            <label htmlFor="description" className={style.formLabel}>
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              placeholder="Provide an overview of the product style, fit, and appearance..."
              value={formData.description}
              onChange={handleInputChange}
              className={style.formTextarea}
            />
          </div>
        </div>

        {/* SECTION 2: PRODUCT SPECIFICATIONS */}
        <div className={style.formCard} style={{ marginTop: "24px" }}>
          <div className={style.cardHeader}>
            <div>
              <h2 className={style.cardTitle}>Product Specifications</h2>
              <p className={style.cardSubtitle}>
                Key features, fabric details, and care guide
              </p>
            </div>
          </div>

          <div className={style.grid2}>
            <div className={style.formGroup}>
              <div className={style.labelWrapper}>
                <label htmlFor="highlights" className={style.formLabel}>
                  Highlights *
                </label>
                <span className={style.helperBadge}>
                  separate info by comma ( , )
                </span>
              </div>
              <input
                id="highlights"
                name="highlights"
                type="text"
                required
                placeholder="e.g. Breathable cotton fabric, Button-down collar, Regular fit"
                value={formData.highlights}
                onChange={handleInputChange}
                className={style.formInput}
              />
            </div>

            <div className={style.formGroup}>
              <div className={style.labelWrapper}>
                <label htmlFor="composition" className={style.formLabel}>
                  Composition *
                </label>
                <span className={style.helperBadge}>
                  separate info by comma ( , )
                </span>
              </div>
              <input
                id="composition"
                name="composition"
                type="text"
                required
                placeholder="e.g. 100% Premium Cotton, 180 GSM woven fabric"
                value={formData.composition}
                onChange={handleInputChange}
                className={style.formInput}
              />
            </div>
          </div>

          <div className={style.grid2} style={{ marginTop: "8px" }}>
            <div className={style.formGroup}>
              <div className={style.labelWrapper}>
                <label htmlFor="care" className={style.formLabel}>
                  Care *
                </label>
              </div>
              <input
                id="care"
                name="care"
                type="text"
                required
                placeholder="e.g. Machine wash cold with like colors, Do not bleach"
                value={formData.care}
                onChange={handleInputChange}
                className={style.formInput}
              />
            </div>

            <div className={style.formGroup}>
              <div className={style.labelWrapper}>
                <label htmlFor="extra_info" className={style.formLabel}>
                  Extra Info *
                </label>
                <span className={style.helperBadge}>
                  separate info by comma ( , )
                </span>
              </div>
              <input
                id="extra_info"
                name="extra_info"
                type="text"
                required
                placeholder="e.g. Model is 6ft wearing size L, Made in India"
                value={formData.extra_info}
                onChange={handleInputChange}
                className={style.formInput}
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: 5 IMAGE UPLOAD BOXES WITH PREVIEWS */}
        <div className={style.formCard} style={{ marginTop: "24px" }}>
          <div className={style.cardHeader}>
            <div>
              <h2 className={style.cardTitle}>Product Images (5 Slots)</h2>
              <p className={style.cardSubtitle}>
                Attach up to 5 high-resolution images. The first box will be the
                primary cover image.
              </p>
            </div>
          </div>

          <div className={style.imageBoxesGrid}>
            {images.map((img, index) => (
              <div
                key={index}
                className={`${style.imageBox} ${
                  img ? style.imageBoxFilled : ""
                }`}
              >
                {/* Slot Tag */}
                <span
                  className={`${style.slotTag} ${
                    index === 0 ? style.primarySlotTag : ""
                  }`}
                >
                  {index === 0 ? "Cover (1)" : `Image ${index + 1}`}
                </span>

                {img ? (
                  <>
                    <img
                      src={img.preview}
                      alt={`Slot ${index + 1} Preview`}
                      className={style.previewImg}
                    />
                    <button
                      type="button"
                      className={style.removeImageBtn}
                      onClick={(e) => handleRemoveImage(index, e)}
                      title="Remove image"
                    >
                      <i className="ri-close-line" />
                    </button>
                  </>
                ) : (
                  <>
                    <div className={style.uploadPrompt}>
                      <div className={style.uploadIcon}>
                        <i
                          className="ri-image-add-line"
                          style={{ fontSize: "1.5rem" }}
                        />
                      </div>
                      <span className={style.uploadText}>
                        {index === 0 ? "+ Add Cover" : "+ Add Image"}
                      </span>
                    </div>

                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageChange(index, e)}
                      className={style.hiddenFileInput}
                      title={`Upload Image ${index + 1}`}
                    />
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 4: PRODUCT VARIANTS */}
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
              <span>Add Variant</span>
            </button>
          </div>

          <div className={style.variantsContainer}>
            {variants.map((v, index) => (
              <div key={v.id} className={style.variantRow}>
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
                    style={{
                      opacity: variants.length <= 1 ? 0.4 : 1,
                      cursor: variants.length <= 1 ? "not-allowed" : "pointer",
                    }}
                  >
                    <i className="ri-delete-bin-line" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Form Actions */}
        <div className={style.bottomActions}>
          <Link to="/dashboard/products" className={style.cancelBtn}>
            Cancel
          </Link>
          <button
            type="submit"
            className={style.submitBtn}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating Product..." : "Save Product"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
