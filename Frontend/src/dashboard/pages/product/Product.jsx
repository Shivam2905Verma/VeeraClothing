import { useEffect, useState, useMemo } from "react";
import {
  getAllProducts,
  activateProduct,
  deactivateProduct,
  deleteProduct,
} from "../../service/product.service";
import ConfirmModal from "../../../common/ConfirmModal";
import Toast from "../../../common/Toast";
import ProductTopBar from "../../components/products/product/ProductTopBar";
import ProductCard from "../../components/products/product/ProductCard";
import style from "../../style/page/product.module.css";

const Product = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortField, setSortField] = useState("id");
  const [sortDirection, setSortDirection] = useState("desc");

  // Toast State
  const [toast, setToast] = useState({ message: "", type: "error" });
  const showToast = (message, type = "error") => setToast({ message, type });

  // Delete Confirmation Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getAllProducts();
      if (data && data.products) {
        setProducts(data.products);
      }
    } catch (error) {
      showToast(
        error?.response?.data?.message || "Failed to load products.",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Filter products based on search query & status filter
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // 1. Status Filter
    if (statusFilter === "ACTIVE") {
      result = result.filter((p) => p.is_active);
    } else if (statusFilter === "INACTIVE") {
      result = result.filter((p) => !p.is_active);
    }

    // 2. Search Query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (item) =>
          item.name?.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query) ||
          String(item.id).includes(query) ||
          String(item.price).includes(query) ||
          item.category?.name?.toLowerCase().includes(query) ||
          item.category_name?.toLowerCase().includes(query),
      );
    }

    // 3. Sorting
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
  }, [products, searchQuery, statusFilter, sortField, sortDirection]);

  // Handle Sort Change
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

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

  // Open delete confirmation modal
  const handleOpenDelete = (product) => {
    setProductToDelete(product);
    setDeleteModalOpen(true);
  };

  // Confirm permanent delete
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

      {/* TOP BAR Component */}
      <ProductTopBar
        totalCount={products.length}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        onRefresh={fetchProducts}
      />

      {/* PRODUCTS TABLE */}
      {loading ? (
        <div className={style.loadingSpinner}>
          <i
            className="ri-loader-4-line ri-spin"
            style={{ fontSize: "1.75rem", color: "#6b7280" }}
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
        <div className={style.tableWrapper}>
          <table className={style.table}>
            <thead>
              <tr className={style.tableHeaderRow}>
                {/* Product Column */}
                <th
                  className={`${style.tableHeader} ${style.sortableHeader}`}
                  onClick={() => handleSort("name")}
                >
                  <div className={style.headerContent}>
                    <span>Product</span>
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

                {/* Status Column */}
                <th className={style.tableHeader}>
                  <div className={style.headerContent}>
                    <span>Status</span>
                  </div>
                </th>

                {/* Category Column */}
                <th className={style.tableHeader}>
                  <div className={style.headerContent}>
                    <span>Category</span>
                  </div>
                </th>

                {/* Price Column */}
                <th
                  className={`${style.tableHeader} ${style.sortableHeader}`}
                  onClick={() => handleSort("price")}
                >
                  <div className={style.headerContent}>
                    <span>Price</span>
                    {sortField === "price" && (
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

                {/* Actions Column */}
                <th className={`${style.tableHeader} ${style.actionsHeader}`}>
                  <span>Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onToggleStatus={handleToggleStatus}
                  onDelete={handleOpenDelete}
                />
              ))}
            </tbody>
          </table>

          {/* Table Footer with Summary */}
          <div className={style.tableFooter}>
            <span className={style.footerInfo}>
              Showing {filteredProducts.length} of {products.length} products
            </span>
          </div>
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
