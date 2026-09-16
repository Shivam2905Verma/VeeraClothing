import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getProductById, updateProduct } from "../../service/product.service";
import { getCategories } from "../../service/category.service";
import Toast from "../../../common/Toast";
import style from "../../style/page/addProduct.module.css";

const TOTAL_IMAGE_SLOTS = 5;

const EditProduct = () => {
  const { id } = useParams();
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

  // 5 Image Upload Slots (each is null or { file: File, preview: string, existing?: boolean })
  const [images, setImages] = useState(Array(TOTAL_IMAGE_SLOTS).fill(null));

  // Categories Dropdown Data
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Status & Feedback
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "error" });
  const showToast = (message, type = "error") => setToast({ message, type });

  // Fetch product data and categories on mount
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        // Fetch categories and product concurrently
        const [catData, prodData] = await Promise.all([
          getCategories(),
          getProductById(id),
        ]);

        if (isMounted && catData?.categories) {
          setCategories(catData.categories);
        }

        if (isMounted && prodData?.product) {
          const p = prodData.product;
          setFormData({
            name: p.name || "",
            description: p.description || "",
            category_id: p.category_id ? String(p.category_id) : "",
            highlights: p.highlights || "",
            composition: p.composition || "",
            care: p.care || "",
            extra_info: p.extra_info || "",
          });

          // Populate existing images into slots
          const initialSlots = Array(TOTAL_IMAGE_SLOTS).fill(null);
          if (p.images && p.images.length > 0) {
            p.images.slice(0, TOTAL_IMAGE_SLOTS).forEach((imgObj, idx) => {
              initialSlots[idx] = {
                file: null,
                preview: imgObj.image_url,
                existing: true,
              };
            });
          } else if (p.image_url) {
            initialSlots[0] = {
              file: null,
              preview: p.image_url,
              existing: true,
            };
          }
          setImages(initialSlots);
        } else if (isMounted) {
          showToast("Product not found.", "error");
        }
      } catch (error) {
        console.error("Failed to load product for editing:", error);
        if (isMounted) {
          showToast(
            error.response?.data?.message ||
              "Failed to load product details. Please try again.",
            "error",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoadingProduct(false);
          setCategoriesLoading(false);
        }
      }
    };

    if (id) {
      loadData();
    }

    return () => {
      isMounted = false;
    };
  }, [id]);

  // Cleanup newly created object URLs on unmount
  useEffect(() => {
    return () => {
      images.forEach((img) => {
        if (img && img.preview && !img.existing) {
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
      if (updated[index]?.preview && !updated[index]?.existing) {
        URL.revokeObjectURL(updated[index].preview);
      }
      updated[index] = { file, preview, existing: false };
      return updated;
    });
  };

  // Remove image from a specific slot
  const handleRemoveImage = (index, e) => {
    e.stopPropagation();
    setImages((prev) => {
      const updated = [...prev];
      if (updated[index]?.preview && !updated[index]?.existing) {
        URL.revokeObjectURL(updated[index].preview);
      }
      updated[index] = null;
      return updated;
    });
  };

  // Form Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Validation: Category selection
    if (!formData.category_id) {
      showToast("Please select a category for this product.", "error");
      return;
    }

    if (!formData.name.trim()) {
      showToast("Product name cannot be empty.", "error");
      return;
    }

    try {
      setIsSubmitting(true);

      const updatePayload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        category_id: Number(formData.category_id),
        highlights: formData.highlights.trim(),
        composition: formData.composition.trim(),
        care: formData.care.trim(),
        extra_info: formData.extra_info.trim(),
      };

      await updateProduct(id, updatePayload);

      showToast("Product updated successfully!", "success");

      // Redirect after brief delay
      setTimeout(() => {
        navigate("/dashboard/products");
      }, 1000);
    } catch (error) {
      console.error("Failed to update product:", error);
      const msg =
        error.response?.data?.message ||
        error.response?.data?.errors?.[0]?.message ||
        "Failed to update product. Please check your inputs.";
      showToast(msg, "error");
      setIsSubmitting(false);
    }
  };

  if (isLoadingProduct) {
    return (
      <div className={style.pageContainer}>
        <div style={{ textAlign: "center", padding: "60px 20px", color: "#64748b" }}>
          <p>Loading product details from database...</p>
        </div>
      </div>
    );
  }

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
            to="/dashboard/products"
            className={style.backLink}
            title="Back to Products"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </Link>
          <div>
            <h1 className={style.headerTitle}>Edit Product</h1>
            <p className={style.headerSubtitle}>
              Update product specifications, category, and information.
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
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ animation: "spin 1s linear infinite" }}
                >
                  <line x1="12" y1="2" x2="12" y2="6" />
                  <line x1="12" y1="18" x2="12" y2="22" />
                  <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
                  <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
                  <line x1="2" y1="12" x2="6" y2="12" />
                  <line x1="18" y1="12" x2="22" y2="12" />
                </svg>
                <span>Updating Product...</span>
              </>
            ) : (
              <>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Save Changes</span>
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
                <span className={style.helperBadge}>separate info by comma ( , )</span>
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
                <span className={style.helperBadge}>separate info by comma ( , )</span>
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
                <span className={style.helperBadge}>separate info by comma ( , )</span>
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
                Current images loaded from the database.
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
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </>
                ) : (
                  <>
                    <div className={style.uploadPrompt}>
                      <div className={style.uploadIcon}>
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect
                            x="3"
                            y="3"
                            width="18"
                            height="18"
                            rx="2"
                            ry="2"
                          />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <polyline points="21 15 16 10 5 21" />
                        </svg>
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
            {isSubmitting ? "Updating Product..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProduct;
