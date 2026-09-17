import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getProductById, updateProduct } from "../../service/product.service";
import { getCategories } from "../../service/category.service";
import Toast from "../../../common/Toast";
import EditProductImagesSection from "../../components/products/editproduct/EditProductImagesSection";
import EditProductVariantsSection from "../../components/products/editproduct/EditProductVariantsSection";
import style from "../../style/page/editProduct.module.css";

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
  const [initialFormData, setInitialFormData] = useState(null);

  // 5 Image Upload Slots (each is null or { file: File, preview: string, existing?: boolean })
  const [images, setImages] = useState(Array(TOTAL_IMAGE_SLOTS).fill(null));

  // Variants Data
  const [variants, setVariants] = useState([]);

  // Categories Dropdown Data
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Status & Feedback
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "error" });
  const showToast = (message, type = "error") => setToast({ message, type });

  // Helper to populate image slots from product payload
  const populateImagesFromProduct = useCallback((p) => {
    const initialSlots = Array(TOTAL_IMAGE_SLOTS).fill(null);
    if (p.images && p.images.length > 0) {
      p.images.slice(0, TOTAL_IMAGE_SLOTS).forEach((imgObj, idx) => {
        initialSlots[idx] = {
          id: imgObj.id,
          public_id: imgObj.public_id,
          file: null,
          preview: imgObj.image_url,
          existing: true,
        };
      });
    } else if (p.image_url) {
      initialSlots[0] = {
        id: null,
        public_id: null,
        file: null,
        preview: p.image_url,
        existing: true,
      };
    }
    setImages(initialSlots);
  }, []);

  // Fetch product data and categories on mount
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const [catData, prodData] = await Promise.all([
          getCategories(),
          getProductById(id),
        ]);

        if (isMounted && catData?.categories) {
          setCategories(catData.categories);
        }

        if (isMounted && prodData?.product) {
          const p = prodData.product;
          const initialData = {
            name: p.name || "",
            description: p.description || "",
            category_id: p.category_id ? String(p.category_id) : "",
            highlights: p.highlights || "",
            composition: p.composition || "",
            care: p.care || "",
            extra_info: p.extra_info || "",
          };
          setFormData(initialData);
          setInitialFormData(initialData);

          // Populate existing images into slots
          populateImagesFromProduct(p);

          // Populate existing variants
          if (p.variants && p.variants.length > 0) {
            setVariants(p.variants);
          }
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
  }, [id, populateImagesFromProduct]);

  // Handle standard text inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Determine if form data has been modified
  const isFormChanged = initialFormData
    ? Object.keys(initialFormData).some(
        (key) => (formData[key] || "") !== (initialFormData[key] || ""),
      )
    : false;

  // Form Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();

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
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            color: "#64748b",
          }}
        >
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
            <i className="ri-arrow-left-line" style={{ fontSize: "1.25rem" }} />
          </Link>
          <div>
            <h1 className={style.headerTitle}>Edit Product</h1>
            <p className={style.headerSubtitle}>
              Update product specifications, category, and information.
            </p>
          </div>
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

        {/* Bottom Form Actions */}
        <div className={style.bottomActions}>
          <Link to="/dashboard/products" className={style.cancelBtn}>
            Cancel
          </Link>
          <button
            type="submit"
            className={style.submitBtn}
            disabled={!isFormChanged || isSubmitting}
            title={
              !isFormChanged
                ? "No changes made to product details"
                : "Save changes"
            }
          >
            {isSubmitting ? "Updating Product..." : "Save Changes"}
          </button>
        </div>

        {/* SECTION 3: PRODUCT IMAGES (Extracted Component) */}
        <EditProductImagesSection
          productId={id}
          images={images}
          setImages={setImages}
          populateImagesFromProduct={populateImagesFromProduct}
          showToast={showToast}
        />

        {/* SECTION 4: PRODUCT VARIANTS (Extracted Component) */}
        <EditProductVariantsSection
          variants={variants}
          setVariants={setVariants}
          showToast={showToast}
        />
      </form>
    </div>
  );
};

export default EditProduct;
