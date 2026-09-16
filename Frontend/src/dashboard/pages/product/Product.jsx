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
            <i className="ri-add-line" style={{ fontSize: "1rem" }} />
            <span>Add Product</span>
          </Link>
        </div>

        <div className={style.topRight}>
          <div className={style.searchContainer}>
            <span className={style.searchIcon}>
              <i className="ri-search-line" />
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
                <i className="ri-close-line" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* PRODUCTS LIST (RECTANGLE CARDS: 3 BUTTONS, NAME AT CENTER, IMAGE AT RIGHT) */}
      {loading ? (
        <div className={style.loadingSpinner}>
          <i
            className="ri-loader-4-line ri-spin"
            style={{ fontSize: "2rem" }}
          />
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className={style.emptyContainer}>
          <div className={style.emptyIcon}>
            <i className="ri-inbox-line" style={{ fontSize: "2.5rem" }} />
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
                  <i className="ri-edit-line" />
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
                      <i className="ri-checkbox-circle-line" />
                      <span>Active</span>
                    </>
                  ) : (
                    <>
                      <i className="ri-close-circle-line" />
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
                  <i className="ri-delete-bin-line" />
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
                    <i
                      className="ri-image-line"
                      style={{ fontSize: "1.5rem" }}
                    />
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
