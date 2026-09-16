import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  getAllProducts,
  activateProduct,
  deactivateProduct,
  deleteProduct,
} from "../../service/product.service";
import ConfirmModal from "../../../common/ConfirmModal";
import Toast from "../../../common/Toast";
import style from "../../style/page/product.module.css";

const Product = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Toast State
  const [toast, setToast] = useState({ message: "", type: "error" });
  const showToast = (message, type = "error") => setToast({ message, type });

  // Delete Confirmation Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadProducts = async () => {
      try {
        const data = await getAllProducts();
        if (isMounted && data && data.products) {
          setProducts(data.products);
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
        if (isMounted) {
          showToast(
            "Failed to load products. Please check your network.",
            "error",
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  // Filter products based on search query (name or id)
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const query = searchQuery.toLowerCase().trim();
    return products.filter(
      (item) =>
        item.name?.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        String(item.id).includes(query) ||
        String(item.price).includes(query),
    );
  }, [products, searchQuery]);

  // Toggle Active / Deactive handler
  const handleToggleStatus = async (product) => {
    try {
      if (product.is_active) {
        await deactivateProduct(product.id);
        showToast(`"${product.name}" deactivated successfully.`, "success");
      } else {
        await activateProduct(product.id);
        showToast(`"${product.name}" activated successfully.`, "success");
      }

      // Optimistically update local state
      setProducts((prev) =>
        prev.map((item) =>
          item.id === product.id
            ? { ...item, is_active: !item.is_active }
            : item,
        ),
      );
    } catch (error) {
      console.error("Failed to toggle product status:", error);
      showToast(
        error.response?.data?.message || "Failed to update product status.",
        "error",
      );
    }
  };

  // Open delete confirmation
  const handleOpenDelete = (product) => {
    setProductToDelete(product);
    setDeleteModalOpen(true);
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    try {
      setIsDeleting(true);
      await deleteProduct(productToDelete.id);
      setProducts((prev) =>
        prev.filter((item) => item.id !== productToDelete.id),
      );
      showToast(`"${productToDelete.name}" deleted permanently.`, "success");
      setDeleteModalOpen(false);
      setProductToDelete(null);
    } catch (error) {
      console.error("Failed to delete product:", error);
      showToast(
        error.response?.data?.message ||
          "Cannot permanently delete product (e.g., active orders exist). Please deactivate instead.",
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

      {/* TOP BAR: Total Count at Left, Search Bar at Right */}
      <div className={style.topBar}>
        <div className={style.topLeft}>
          <div className={style.titleGroup}>
            <h1 className={style.pageTitle}>Products</h1>
            <span className={style.totalBadge}>Total: {products.length}</span>
          </div>
          <Link to="/dashboard/products/add" className={style.addProductBtn}>
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
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Add Product</span>
          </Link>
        </div>

        <div className={style.topRight}>
          <div className={style.searchContainer}>
            <span className={style.searchIcon}>
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
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search products by name or price..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={style.searchInput}
            />
            {searchQuery && (
              <button
                type="button"
                className={style.clearSearchBtn}
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* PRODUCTS LIST (RECTANGLE CARDS: 3 BUTTONS, NAME AT CENTER, IMAGE AT RIGHT) */}
      {loading ? (
        <div className={style.loadingSpinner}>
          <svg
            width="32"
            height="32"
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
            <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
            <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
          </svg>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className={style.emptyContainer}>
          <div className={style.emptyIcon}>
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          </div>
          <h3 className={style.emptyTitle}>No Products Found</h3>
          <p className={style.emptySubtitle}>
            {searchQuery
              ? `No products match "${searchQuery}". Try a different search term.`
              : "No products in inventory yet. Click 'Add Product' to get started."}
          </p>
        </div>
      ) : (
        <div className={style.productList}>
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className={`${style.productCard} ${
                !product.is_active ? style.inactiveCard : ""
              }`}
            >
              {/* Three Action Buttons: Edit, Active/Deactivate, Delete */}
              <div className={style.actionButtons}>
                {/* 1. Edit Button (Links to EditProduct page) */}
                <Link
                  to={`/dashboard/products/edit/${product.id}`}
                  className={`${style.btn} ${style.editBtn}`}
                  title="Edit product"
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  <span>Edit</span>
                </Link>

                {/* 2. Active / Deactive Toggle Button */}
                <button
                  type="button"
                  className={`${style.btn} ${
                    product.is_active
                      ? style.toggleBtnActive
                      : style.toggleBtnInactive
                  }`}
                  onClick={() => handleToggleStatus(product)}
                  title={
                    product.is_active
                      ? "Click to deactivate product"
                      : "Click to activate product"
                  }
                >
                  {product.is_active ? (
                    <>
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                      <span>Active</span>
                    </>
                  ) : (
                    <>
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                      </svg>
                      <span>Deactive</span>
                    </>
                  )}
                </button>

                {/* 3. Delete Button */}
                <button
                  type="button"
                  className={`${style.btn} ${style.deleteBtn}`}
                  onClick={() => handleOpenDelete(product)}
                  title="Delete product permanently"
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    <line x1="10" y1="11" x2="10" y2="17" />
                    <line x1="14" y1="11" x2="14" y2="17" />
                  </svg>
                  <span>Delete</span>
                </button>
              </div>

              {/* Product Details (Name at Center) */}
              <div className={style.cardCenter}>
                <div className={style.nameRow}>
                  <h2 className={style.productName}>{product.name}</h2>
                  <span
                    className={`${style.statusPill} ${
                      product.is_active
                        ? style.statusPillActive
                        : style.statusPillInactive
                    }`}
                  >
                    {product.is_active ? "Live" : "Disabled"}
                  </span>
                </div>

                <div className={style.productMeta}>
                  <span className={style.productPrice}>₹{product.price}</span>
                  <span
                    className={`${style.productStock} ${
                      product.stock <= 0 ? style.stockOut : ""
                    }`}
                  >
                    {product.stock > 0
                      ? `Stock: ${product.stock}`
                      : "Out of stock"}
                  </span>
                  {product.description && (
                    <span
                      style={{
                        fontSize: "0.8rem",
                        color: "#64748b",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        maxWidth: "300px",
                      }}
                    >
                      {product.description}
                    </span>
                  )}
                </div>
              </div>

              {/* Product Image at Right */}
              <div className={style.cardRight}>
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className={style.productImg}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "https://via.placeholder.com/90?text=Product";
                    }}
                  />
                ) : (
                  <div className={style.placeholderImg}>
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Product"
        message={`Are you sure you want to permanently delete "${productToDelete?.name}"? If there are past customer orders for this product, please deactivate it instead.`}
        confirmText="Delete Product"
        cancelText="Cancel"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          if (!isDeleting) {
            setDeleteModalOpen(false);
            setProductToDelete(null);
          }
        }}
      />
    </div>
  );
};

export default Product;
