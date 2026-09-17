import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createProduct } from "../../service/product.service";
import { getCategories } from "../../service/category.service";
import Toast from "../../../common/Toast";
import AddProductBasicInfo from "../../components/products/addproduct/AddProductBasicInfo";
import AddProductSpecifications from "../../components/products/addproduct/AddProductSpecifications";
import AddProductImagesSection from "../../components/products/addproduct/AddProductImagesSection";
import AddProductVariantsSection from "../../components/products/addproduct/AddProductVariantsSection";
import style from "../../style/page/addProduct.module.css";

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

  // Handle standard text inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
      </div>

      <form onSubmit={handleSubmit}>
        {/* SECTION 1: BASIC INFORMATION */}
        <AddProductBasicInfo
          formData={formData}
          handleInputChange={handleInputChange}
          categories={categories}
          categoriesLoading={categoriesLoading}
        />

        {/* SECTION 2: PRODUCT SPECIFICATIONS */}
        <AddProductSpecifications
          formData={formData}
          handleInputChange={handleInputChange}
        />

        {/* SECTION 3: PRODUCT IMAGES (5 SLOTS) */}
        <AddProductImagesSection
          images={images}
          setImages={setImages}
          showToast={showToast}
        />

        {/* SECTION 4: PRODUCT VARIANTS */}
        <AddProductVariantsSection
          variants={variants}
          setVariants={setVariants}
          showToast={showToast}
        />

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
